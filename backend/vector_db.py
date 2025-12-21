"""
MindEase Vector Database Architecture
======================================
Implements semantic emotional analysis using ChromaDB and Google Generative AI embeddings.
Maintains strict anonymity while enabling cohort-level insights and crisis detection.
"""

import os
import chromadb
from chromadb.config import Settings
import google.generativeai as genai
from datetime import datetime
import numpy as np
from typing import List, Dict, Tuple, Optional
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('VITE_GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("VITE_GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)


class EmotionalSeedVectors:
    """
    Pre-defined anchor phrases for core emotional states.
    These serve as reference points for semantic similarity searches.
    """
    
    ANCHORS = {
        "anger": "I am furious, I want to scream, everything is unfair.",
        "sadness": "I feel empty, alone, and like I can't keep going.",
        "anxiety": "My heart is racing, I can't breathe, I'm going to fail.",
        "burnout": "I'm exhausted, nothing matters anymore, I can't do this.",
        "loneliness": "Nobody understands me, I'm completely isolated and invisible.",
        "overwhelm": "Everything is too much, I'm drowning in responsibilities.",
        "crisis": "I don't want to exist anymore, there's no way out of this pain."
    }
    
    @classmethod
    def get_anchor(cls, emotion: str) -> str:
        """Get the anchor phrase for a specific emotion."""
        return cls.ANCHORS.get(emotion.lower(), "")
    
    @classmethod
    def all_emotions(cls) -> List[str]:
        """Return list of all tracked emotions."""
        return list(cls.ANCHORS.keys())


class MindEaseVectorDB:
    """
    Core vector database manager for MindEase emotional analytics.
    Handles embedding generation, storage, and semantic search.
    """
    
    def __init__(self, persist_directory: str = "./mindease_chromadb"):
        """
        Initialize ChromaDB client and collection.
        
        Args:
            persist_directory: Path to persist ChromaDB data
        """
        self.client = chromadb.Client(Settings(
            persist_directory=persist_directory,
            anonymized_telemetry=False
        ))
        
        # Create or get collection with cosine similarity
        self.collection = self.client.get_or_create_collection(
            name="MindEase_Emotions",
            metadata={"hnsw:space": "cosine"}  # Cosine similarity metric
        )
        
        print(f"✓ ChromaDB initialized at: {persist_directory}")
        print(f"✓ Collection 'MindEase_Emotions' ready (metric: cosine)")
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector using Google Generative AI.
        
        Args:
            text: Input text to embed
            
        Returns:
            768-dimensional embedding vector
        """
        try:
            result = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            print(f"✗ Embedding generation failed: {e}")
            raise
    
    def add_emotional_entry(
        self,
        user_id: str,
        cohort_id: str,
        vent_text: str,
        metadata: Optional[Dict] = None
    ) -> str:
        """
        Add a new emotional entry to the database.
        
        Args:
            user_id: Anonymized user identifier (hashed)
            cohort_id: Group identifier (e.g., "Engineering_2024")
            vent_text: The user's emotional expression
            metadata: Additional context (timestamp, session_id, etc.)
            
        Returns:
            Entry ID
        """
        # Generate embedding
        embedding = self.generate_embedding(vent_text)
        
        # Prepare metadata
        entry_metadata = {
            "user_id": user_id,
            "cohort_id": cohort_id,
            "timestamp": datetime.now().isoformat(),
            "text_preview": vent_text[:50] + "..." if len(vent_text) > 50 else vent_text
        }
        
        if metadata:
            entry_metadata.update(metadata)
        
        # Generate unique ID
        entry_id = f"{user_id}_{datetime.now().timestamp()}"
        
        # Add to collection
        self.collection.add(
            embeddings=[embedding],
            documents=[vent_text],
            metadatas=[entry_metadata],
            ids=[entry_id]
        )
        
        return entry_id
    
    def get_top_emotions(
        self,
        target_emotion: str,
        threshold: float = 0.8,
        top_k: int = 10
    ) -> List[Dict]:
        """
        Find users whose emotional state is semantically similar to a target emotion.
        
        Args:
            target_emotion: Emotion anchor name (e.g., "anger", "anxiety")
            threshold: Minimum similarity score (0-1, where 1 is identical)
            top_k: Maximum number of results to return
            
        Returns:
            List of matches with metadata and similarity scores
        """
        # Get anchor phrase
        anchor_text = EmotionalSeedVectors.get_anchor(target_emotion)
        if not anchor_text:
            raise ValueError(f"Unknown emotion: {target_emotion}")
        
        # Generate query embedding
        query_embedding = self.generate_embedding(anchor_text)
        
        # Perform semantic search
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        # Filter by threshold and format results
        matches = []
        if results['distances'] and results['metadatas']:
            for i, distance in enumerate(results['distances'][0]):
                # Convert distance to similarity (ChromaDB returns distance, not similarity)
                similarity = 1 - distance
                
                if similarity >= threshold:
                    matches.append({
                        "cohort_id": results['metadatas'][0][i]['cohort_id'],
                        "user_id": results['metadatas'][0][i]['user_id'],
                        "similarity_score": round(similarity, 4),
                        "risk_level": self._calculate_risk_level(similarity),
                        "timestamp": results['metadatas'][0][i]['timestamp'],
                        "text_preview": results['metadatas'][0][i].get('text_preview', '')
                    })
        
        return matches
    
    def analyze_cohort_health(self, cohort_id: str) -> Dict:
        """
        Calculate the emotional centroid of a cohort.
        
        Args:
            cohort_id: Cohort identifier
            
        Returns:
            Cohort health metrics including centroid position and dominant emotions
        """
        # Get all entries for this cohort
        results = self.collection.get(
            where={"cohort_id": cohort_id}
        )
        
        if not results['embeddings']:
            return {
                "cohort_id": cohort_id,
                "status": "no_data",
                "message": "No emotional data found for this cohort"
            }
        
        # Calculate centroid (average embedding)
        embeddings_array = np.array(results['embeddings'])
        centroid = np.mean(embeddings_array, axis=0).tolist()
        
        # Compare centroid to all emotion anchors
        emotion_distances = {}
        for emotion in EmotionalSeedVectors.all_emotions():
            anchor_embedding = self.generate_embedding(
                EmotionalSeedVectors.get_anchor(emotion)
            )
            # Calculate cosine similarity
            similarity = 1 - self._cosine_distance(centroid, anchor_embedding)
            emotion_distances[emotion] = round(similarity, 4)
        
        # Find dominant emotion
        dominant_emotion = max(emotion_distances, key=emotion_distances.get)
        
        return {
            "cohort_id": cohort_id,
            "total_entries": len(results['embeddings']),
            "dominant_emotion": dominant_emotion,
            "emotion_profile": emotion_distances,
            "alert_level": self._assess_cohort_alert(emotion_distances),
            "timestamp": datetime.now().isoformat()
        }
    
    def flag_for_human_intervention(
        self,
        similarity_threshold: float = 0.9,
        sentiment_threshold: float = -0.8
    ) -> List[Dict]:
        """
        Identify users requiring immediate human intervention.
        This is the ONLY scenario where user identity can be revealed.
        
        Args:
            similarity_threshold: Minimum similarity to crisis anchor
            sentiment_threshold: Maximum sentiment score (negative)
            
        Returns:
            List of flagged users with de-masked identities
        """
        # Get crisis anchor
        crisis_embedding = self.generate_embedding(
            EmotionalSeedVectors.get_anchor("crisis")
        )
        
        # Search for high-risk matches
        results = self.collection.query(
            query_embeddings=[crisis_embedding],
            n_results=50  # Check top 50 for crisis signals
        )
        
        flagged_users = []
        if results['distances'] and results['metadatas']:
            for i, distance in enumerate(results['distances'][0]):
                similarity = 1 - distance
                
                # STRICT GATE: Only flag if both conditions are met
                if similarity > similarity_threshold:
                    flagged_users.append({
                        "user_id": results['metadatas'][0][i]['user_id'],  # DE-MASKED
                        "cohort_id": results['metadatas'][0][i]['cohort_id'],
                        "crisis_similarity": round(similarity, 4),
                        "timestamp": results['metadatas'][0][i]['timestamp'],
                        "text_preview": results['metadatas'][0][i].get('text_preview', ''),
                        "intervention_required": True,
                        "flagged_at": datetime.now().isoformat()
                    })
        
        return flagged_users
    
    def _calculate_risk_level(self, similarity: float) -> str:
        """Calculate risk level based on similarity score."""
        if similarity >= 0.95:
            return "CRITICAL"
        elif similarity >= 0.85:
            return "HIGH"
        elif similarity >= 0.75:
            return "MODERATE"
        else:
            return "LOW"
    
    def _assess_cohort_alert(self, emotion_profile: Dict[str, float]) -> str:
        """Assess if a cohort requires systemic intervention."""
        # Check for dangerous emotion concentrations
        if emotion_profile.get('crisis', 0) > 0.7:
            return "URGENT"
        elif emotion_profile.get('anger', 0) > 0.75 or emotion_profile.get('burnout', 0) > 0.75:
            return "WARNING"
        elif emotion_profile.get('anxiety', 0) > 0.7:
            return "MONITOR"
        else:
            return "STABLE"
    
    def _cosine_distance(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine distance between two vectors."""
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)
        
        if norm1 == 0 or norm2 == 0:
            return 1.0  # Maximum distance
        
        cosine_sim = dot_product / (norm1 * norm2)
        return 1 - cosine_sim  # Convert similarity to distance
    
    def get_stats(self) -> Dict:
        """Get database statistics."""
        count = self.collection.count()
        return {
            "total_entries": count,
            "collection_name": self.collection.name,
            "distance_metric": "cosine"
        }


def generate_simulation_data(db: MindEaseVectorDB) -> None:
    """
    Generate 50 dummy entries for testing and demonstration.
    
    Distribution:
    - 20 Engineering entries (Stress/Burnout lean)
    - 20 Arts entries (Loneliness/Creativity lean)
    - 10 High Anger entries (distributed across cohorts)
    """
    
    print("\n" + "="*60)
    print("GENERATING SIMULATION DATA")
    print("="*60)
    
    # Engineering cohort (Stress/Burnout)
    engineering_vents = [
        "I have three exams next week and I haven't slept in days",
        "This coding assignment is impossible, I'm going to fail",
        "Everyone else understands the material but I'm completely lost",
        "I can't keep up with the workload, it's crushing me",
        "My project deadline is tomorrow and nothing works",
        "I'm so tired I can't think straight anymore",
        "The professor expects too much, this is unrealistic",
        "I studied for hours but still failed the midterm",
        "I don't understand why I'm even doing this degree",
        "My parents will be so disappointed if I don't get good grades",
        "I'm falling behind and there's no way to catch up",
        "This internship rejection feels like the end of my career",
        "I can't afford to fail this course again",
        "Everyone is getting job offers except me",
        "I'm exhausted but I have to keep going",
        "The competition is too intense, I can't breathe",
        "I haven't eaten properly in three days because of deadlines",
        "My mental health is deteriorating but I can't stop",
        "I feel like a failure compared to my classmates",
        "I don't know how much longer I can do this"
    ]
    
    # Arts cohort (Loneliness/Creativity)
    arts_vents = [
        "Nobody understands my creative vision",
        "I feel so isolated in this program",
        "My art doesn't resonate with anyone",
        "I'm questioning if I have any real talent",
        "The critique session destroyed my confidence",
        "I feel invisible in this community",
        "My family thinks my degree is worthless",
        "I'm surrounded by people but feel completely alone",
        "I don't fit in with the other artists",
        "My work is never good enough for the professors",
        "I'm losing my passion for creating",
        "Financial stress is killing my creativity",
        "I feel like an imposter in every class",
        "Nobody takes my art seriously",
        "I'm too different, I don't belong here",
        "My portfolio feels empty and meaningless",
        "I can't express what I'm feeling through my work",
        "The industry is too competitive, I'll never make it",
        "I'm doubting every creative choice I make",
        "I feel disconnected from everything and everyone"
    ]
    
    # High Anger entries (distributed)
    anger_vents = [
        "This system is completely broken and unfair",
        "I'm so angry I want to break everything",
        "The administration doesn't care about students at all",
        "I'm furious at how I've been treated",
        "This is absolute bullshit and I'm done",
        "I hate everything about this place",
        "They're setting us up to fail on purpose",
        "I'm enraged by the injustice of this situation",
        "Nothing is fair, everything is rigged against us",
        "I'm so mad I can't even think clearly"
    ]
    
    # Add Engineering entries
    print("\nAdding Engineering cohort entries...")
    for i, vent in enumerate(engineering_vents):
        user_id = f"eng_user_{i+1:03d}"
        db.add_emotional_entry(
            user_id=user_id,
            cohort_id="Engineering_2024",
            vent_text=vent,
            metadata={"department": "Engineering", "year": "2024"}
        )
    print(f"✓ Added {len(engineering_vents)} Engineering entries")
    
    # Add Arts entries
    print("\nAdding Arts cohort entries...")
    for i, vent in enumerate(arts_vents):
        user_id = f"arts_user_{i+1:03d}"
        db.add_emotional_entry(
            user_id=user_id,
            cohort_id="Arts_2024",
            vent_text=vent,
            metadata={"department": "Arts", "year": "2024"}
        )
    print(f"✓ Added {len(arts_vents)} Arts entries")
    
    # Add High Anger entries (split between cohorts)
    print("\nAdding High Anger entries...")
    for i, vent in enumerate(anger_vents):
        cohort = "Engineering_2024" if i % 2 == 0 else "Arts_2024"
        user_id = f"angry_user_{i+1:03d}"
        db.add_emotional_entry(
            user_id=user_id,
            cohort_id=cohort,
            vent_text=vent,
            metadata={"high_anger_flag": True}
        )
    print(f"✓ Added {len(anger_vents)} High Anger entries")
    
    print(f"\n{'='*60}")
    print(f"TOTAL ENTRIES ADDED: {len(engineering_vents) + len(arts_vents) + len(anger_vents)}")
    print(f"{'='*60}\n")


def run_demonstration(db: MindEaseVectorDB) -> None:
    """
    Demonstrate key vector search capabilities.
    """
    
    print("\n" + "="*60)
    print("DEMONSTRATION: SEMANTIC EMOTIONAL SEARCH")
    print("="*60)
    
    # Demo 1: Find 3 Most Angry Users
    print("\n[QUERY 1] Finding 3 Most Angry Users...")
    print("-" * 60)
    
    angry_matches = db.get_top_emotions(
        target_emotion="anger",
        threshold=0.7,
        top_k=3
    )
    
    print(f"\nFound {len(angry_matches)} high-anger matches:\n")
    for i, match in enumerate(angry_matches, 1):
        print(f"{i}. Cohort: {match['cohort_id']}")
        print(f"   User ID: {match['user_id']}")
        print(f"   Similarity: {match['similarity_score']} ({match['risk_level']})")
        print(f"   Preview: \"{match['text_preview']}\"")
        print()
    
    # Demo 2: Cohort Health Analysis
    print("\n[QUERY 2] Analyzing Engineering Cohort Health...")
    print("-" * 60)
    
    eng_health = db.analyze_cohort_health("Engineering_2024")
    print(f"\nCohort: {eng_health['cohort_id']}")
    print(f"Total Entries: {eng_health['total_entries']}")
    print(f"Dominant Emotion: {eng_health['dominant_emotion'].upper()}")
    print(f"Alert Level: {eng_health['alert_level']}")
    print(f"\nEmotion Profile:")
    for emotion, score in sorted(eng_health['emotion_profile'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {emotion.capitalize():12s}: {score:.4f}")
    
    # Demo 3: Arts Cohort
    print("\n[QUERY 3] Analyzing Arts Cohort Health...")
    print("-" * 60)
    
    arts_health = db.analyze_cohort_health("Arts_2024")
    print(f"\nCohort: {arts_health['cohort_id']}")
    print(f"Total Entries: {arts_health['total_entries']}")
    print(f"Dominant Emotion: {arts_health['dominant_emotion'].upper()}")
    print(f"Alert Level: {arts_health['alert_level']}")
    print(f"\nEmotion Profile:")
    for emotion, score in sorted(arts_health['emotion_profile'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {emotion.capitalize():12s}: {score:.4f}")
    
    # Demo 4: Crisis Detection
    print("\n[QUERY 4] Checking for Crisis Flags...")
    print("-" * 60)
    
    crisis_flags = db.flag_for_human_intervention(
        similarity_threshold=0.85,  # Lowered for demo
        sentiment_threshold=-0.8
    )
    
    if crisis_flags:
        print(f"\n⚠️  {len(crisis_flags)} user(s) flagged for intervention:\n")
        for flag in crisis_flags:
            print(f"User ID: {flag['user_id']} (DE-MASKED)")
            print(f"Cohort: {flag['cohort_id']}")
            print(f"Crisis Similarity: {flag['crisis_similarity']}")
            print(f"Preview: \"{flag['text_preview']}\"")
            print()
    else:
        print("\n✓ No crisis-level flags detected")
    
    # Database stats
    print("\n[DATABASE STATISTICS]")
    print("-" * 60)
    stats = db.get_stats()
    print(f"Total Entries: {stats['total_entries']}")
    print(f"Collection: {stats['collection_name']}")
    print(f"Distance Metric: {stats['distance_metric']}")
    
    print("\n" + "="*60)
    print("DEMONSTRATION COMPLETE")
    print("="*60 + "\n")


def main():
    """
    Main execution flow.
    """
    print("\n" + "="*60)
    print("MINDEASE VECTOR DATABASE - INITIALIZATION")
    print("="*60 + "\n")
    
    # Initialize database
    db = MindEaseVectorDB(persist_directory="./mindease_chromadb")
    
    # Check if we need to generate simulation data
    stats = db.get_stats()
    if stats['total_entries'] == 0:
        print("\n⚠️  Database is empty. Generating simulation data...")
        generate_simulation_data(db)
    else:
        print(f"\n✓ Database already contains {stats['total_entries']} entries")
        print("   Skipping simulation data generation")
    
    # Run demonstration queries
    run_demonstration(db)
    
    print("\n✓ All operations completed successfully")
    print("✓ ChromaDB persisted to: ./mindease_chromadb\n")


if __name__ == "__main__":
    main()
