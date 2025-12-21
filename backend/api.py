"""
MindEase API Server
===================
Flask API to connect the React frontend with the vector database backend.
Provides endpoints for emotional entry storage and cohort analytics.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from vector_db import MindEaseVectorDB, EmotionalSeedVectors
import hashlib
from datetime import datetime
from typing import Dict, List

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize vector database
db = MindEaseVectorDB()

def hash_user_id(raw_user_id: str) -> str:
    """
    Hash user ID for anonymity.
    
    Args:
        raw_user_id: Original user identifier
        
    Returns:
        SHA-256 hashed user ID
    """
    return hashlib.sha256(raw_user_id.encode()).hexdigest()[:16]


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    stats = db.get_stats()
    return jsonify({
        "status": "healthy",
        "database": stats,
        "timestamp": datetime.now().isoformat()
    })


@app.route('/api/vent', methods=['POST'])
def add_vent():
    """
    Add a new emotional entry to the database.
    
    Request Body:
    {
        "user_id": "user123",
        "cohort_id": "Engineering_2024",
        "text": "I'm feeling overwhelmed...",
        "metadata": {
            "session_id": "abc123",
            "mood_label": "Anxious"
        }
    }
    
    Response:
    {
        "success": true,
        "entry_id": "hashed_user_123456789",
        "timestamp": "2025-12-21T12:00:00"
    }
    """
    try:
        data = request.json
        
        # Validate required fields
        if not all(k in data for k in ['user_id', 'cohort_id', 'text']):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, cohort_id, text"
            }), 400
        
        # Hash user ID for anonymity
        hashed_user_id = hash_user_id(data['user_id'])
        
        # Add to database
        entry_id = db.add_emotional_entry(
            user_id=hashed_user_id,
            cohort_id=data['cohort_id'],
            vent_text=data['text'],
            metadata=data.get('metadata', {})
        )
        
        return jsonify({
            "success": True,
            "entry_id": entry_id,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/cohort/<cohort_id>/health', methods=['GET'])
def get_cohort_health(cohort_id: str):
    """
    Get emotional health analysis for a cohort.
    
    Response:
    {
        "cohort_id": "Engineering_2024",
        "total_entries": 30,
        "dominant_emotion": "burnout",
        "alert_level": "WARNING",
        "emotion_profile": {
            "anger": 0.6891,
            "anxiety": 0.7456,
            ...
        }
    }
    """
    try:
        health = db.analyze_cohort_health(cohort_id)
        return jsonify(health)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/search/emotion', methods=['POST'])
def search_by_emotion():
    """
    Search for users experiencing a specific emotion.
    
    Request Body:
    {
        "emotion": "anger",
        "threshold": 0.8,
        "top_k": 10
    }
    
    Response:
    {
        "emotion": "anger",
        "matches": [
            {
                "cohort_id": "Engineering_2024",
                "user_id": "hashed_abc123",
                "similarity_score": 0.8734,
                "risk_level": "HIGH"
            }
        ]
    }
    """
    try:
        data = request.json
        
        emotion = data.get('emotion', 'anxiety')
        threshold = data.get('threshold', 0.8)
        top_k = data.get('top_k', 10)
        
        matches = db.get_top_emotions(
            target_emotion=emotion,
            threshold=threshold,
            top_k=top_k
        )
        
        return jsonify({
            "emotion": emotion,
            "threshold": threshold,
            "matches": matches,
            "count": len(matches)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/crisis/check', methods=['GET'])
def check_crisis_flags():
    """
    Check for users requiring immediate intervention.
    
    ⚠️ RESTRICTED ENDPOINT - Admin only
    This is the ONLY endpoint that reveals user identities.
    
    Response:
    {
        "flagged_users": [
            {
                "user_id": "hashed_xyz789",
                "cohort_id": "Arts_2024",
                "crisis_similarity": 0.9234,
                "intervention_required": true
            }
        ]
    }
    """
    try:
        # In production, add authentication check here
        # if not is_admin(request.headers.get('Authorization')):
        #     return jsonify({"error": "Unauthorized"}), 401
        
        flagged = db.flag_for_human_intervention(
            similarity_threshold=0.9,
            sentiment_threshold=-0.8
        )
        
        return jsonify({
            "flagged_users": flagged,
            "count": len(flagged),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/emotions/anchors', methods=['GET'])
def get_emotion_anchors():
    """
    Get list of available emotion anchors.
    
    Response:
    {
        "emotions": ["anger", "anxiety", "sadness", ...],
        "anchors": {
            "anger": "I am furious, I want to scream...",
            ...
        }
    }
    """
    return jsonify({
        "emotions": EmotionalSeedVectors.all_emotions(),
        "anchors": EmotionalSeedVectors.ANCHORS
    })


@app.route('/api/stats', methods=['GET'])
def get_database_stats():
    """
    Get overall database statistics.
    
    Response:
    {
        "total_entries": 50,
        "collection_name": "MindEase_Emotions",
        "distance_metric": "cosine"
    }
    """
    try:
        stats = db.get_stats()
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("MINDEASE API SERVER")
    print("="*60)
    print(f"\n✓ Vector Database: {db.get_stats()['total_entries']} entries")
    print("✓ CORS: Enabled for React frontend")
    print("✓ Endpoints:")
    print("  - POST   /api/vent")
    print("  - GET    /api/cohort/<id>/health")
    print("  - POST   /api/search/emotion")
    print("  - GET    /api/crisis/check (ADMIN)")
    print("  - GET    /api/emotions/anchors")
    print("  - GET    /api/stats")
    print("\n" + "="*60)
    print("Starting server on http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(debug=True, port=5000)
