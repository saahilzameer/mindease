"""
Test Suite for MindEase Vector Database
========================================
Validates semantic search, cohort analysis, and crisis detection.
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from vector_db import MindEaseVectorDB, EmotionalSeedVectors
import time


def test_initialization():
    """Test 1: Database Initialization"""
    print("\n" + "="*60)
    print("TEST 1: Database Initialization")
    print("="*60)
    
    try:
        db = MindEaseVectorDB(persist_directory="./test_chromadb")
        stats = db.get_stats()
        
        assert stats['collection_name'] == 'MindEase_Emotions'
        assert stats['distance_metric'] == 'cosine'
        
        print("✓ ChromaDB initialized successfully")
        print(f"✓ Collection: {stats['collection_name']}")
        print(f"✓ Metric: {stats['distance_metric']}")
        
        return db
        
    except Exception as e:
        print(f"✗ FAILED: {e}")
        raise


def test_embedding_generation(db):
    """Test 2: Embedding Generation"""
    print("\n" + "="*60)
    print("TEST 2: Embedding Generation")
    print("="*60)
    
    try:
        test_text = "I'm feeling anxious about my upcoming exam"
        
        start_time = time.time()
        embedding = db.generate_embedding(test_text)
        elapsed = (time.time() - start_time) * 1000
        
        assert len(embedding) == 768, f"Expected 768 dimensions, got {len(embedding)}"
        assert all(isinstance(x, float) for x in embedding), "Embedding should be floats"
        
        print(f"✓ Generated 768-dimensional embedding")
        print(f"✓ Time: {elapsed:.2f}ms")
        print(f"✓ Sample values: [{embedding[0]:.4f}, {embedding[1]:.4f}, ...]")
        
    except Exception as e:
        print(f"✗ FAILED: {e}")
        raise


def test_add_entry(db):
    """Test 3: Adding Emotional Entries"""
    print("\n" + "="*60)
    print("TEST 3: Adding Emotional Entries")
    print("="*60)
    
    try:
        # Add test entries
        entries = [
            ("test_user_001", "Engineering_2024", "I'm so stressed about finals"),
            ("test_user_002", "Arts_2024", "I feel completely alone"),
            ("test_user_003", "Engineering_2024", "I'm furious about this unfair grading")
        ]
        
        for user_id, cohort_id, text in entries:
            entry_id = db.add_emotional_entry(
                user_id=user_id,
                cohort_id=cohort_id,
                vent_text=text
            )
            print(f"✓ Added entry: {entry_id[:30]}...")
        
        stats = db.get_stats()
        print(f"\n✓ Total entries in database: {stats['total_entries']}")
        
    except Exception as e:
        print(f"✗ FAILED: {e}")
        raise


def test_semantic_search(db):
    """Test 4: Semantic Emotional Search"""
    print("\n" + "="*60)
    print("TEST 4: Semantic Emotional Search")
    print("="*60)
    
    try:
        # Search for angry users
        start_time = time.time()
        results = db.get_top_emotions(
            target_emotion="anger",
            threshold=0.6,
            top_k=5
        )
        elapsed = (time.time() - start_time) * 1000
        
        print(f"✓ Search completed in {elapsed:.2f}ms")
        print(f"✓ Found {len(results)} matches above threshold 0.6")
        
        if results:
            print("\nTop match:")
            print(f"  Cohort: {results[0]['cohort_id']}")
            print(f"  Similarity: {results[0]['similarity_score']}")
            print(f"  Risk Level: {results[0]['risk_level']}")
        
    except Exception as e:
        print(f"✗ FAILED: {e}")
        raise


def test_cohort_analysis(db):
    """Test 5: Cohort Health Analysis"""
    print("\n" + "="*60)
    print("TEST 5: Cohort Health Analysis")
    print("="*60)
    
    try:
        start_time = time.time()
        health = db.analyze_cohort_health("Engineering_2024")
        elapsed = (time.time() - start_time) * 1000
        
        assert 'dominant_emotion' in health
        assert 'emotion_profile' in health
        assert 'alert_level' in health
        
        print(f"✓ Analysis completed in {elapsed:.2f}ms")
        print(f"✓ Cohort: {health['cohort_id']}")
        print(f"✓ Entries: {health['total_entries']}")
        print(f"✓ Dominant Emotion: {health['dominant_emotion']}")
        print(f"✓ Alert Level: {health['alert_level']}")
        
    except Exception as e:
        print(f"✗ FAILED: {e}")
        raise


def test_crisis_detection(db):
    """Test 6: Crisis Detection"""
    print("\n" + "="*60)
    print("TEST 6: Crisis Detection")
    print("="*60)
    
    try:
        # Add a crisis-level entry
        db.add_emotional_entry(
            user_id="crisis_user_001",
            cohort_id="Engineering_2024",
            vent_text="I don't want to exist anymore, there's no way out of this pain"
        )
        
        # Check for crisis flags
        flagged = db.flag_for_human_intervention(
            similarity_threshold=0.85
        )
        
        print(f"✓ Crisis detection completed")
        print(f"✓ Flagged users: {len(flagged)}")
        
        if flagged:
            print("\n⚠️  Crisis flag detected:")
            print(f"  User ID: {flagged[0]['user_id']} (DE-MASKED)")
            print(f"  Crisis Similarity: {flagged[0]['crisis_similarity']}")
            print(f"  Intervention Required: {flagged[0]['intervention_required']}")
        
    except Exception as e:
        print(f"✗ FAILED: {e}")
        raise


def test_emotion_anchors():
    """Test 7: Emotion Anchor Validation"""
    print("\n" + "="*60)
    print("TEST 7: Emotion Anchor Validation")
    print("="*60)
    
    try:
        emotions = EmotionalSeedVectors.all_emotions()
        
        assert len(emotions) == 7, f"Expected 7 emotions, got {len(emotions)}"
        
        required_emotions = ['anger', 'anxiety', 'sadness', 'crisis']
        for emotion in required_emotions:
            anchor = EmotionalSeedVectors.get_anchor(emotion)
            assert anchor, f"Missing anchor for {emotion}"
        
        print(f"✓ All {len(emotions)} emotion anchors validated")
        print(f"✓ Emotions: {', '.join(emotions)}")
        
    except Exception as e:
        print(f"✗ FAILED: {e}")
        raise


def run_all_tests():
    """Run complete test suite"""
    print("\n" + "="*60)
    print("MINDEASE VECTOR DATABASE - TEST SUITE")
    print("="*60)
    
    try:
        # Test 1: Initialization
        db = test_initialization()
        
        # Test 2: Embedding Generation
        test_embedding_generation(db)
        
        # Test 3: Add Entries
        test_add_entry(db)
        
        # Test 4: Semantic Search
        test_semantic_search(db)
        
        # Test 5: Cohort Analysis
        test_cohort_analysis(db)
        
        # Test 6: Crisis Detection
        test_crisis_detection(db)
        
        # Test 7: Emotion Anchors
        test_emotion_anchors()
        
        # Summary
        print("\n" + "="*60)
        print("ALL TESTS PASSED ✓")
        print("="*60)
        print("\n✓ Database initialization")
        print("✓ Embedding generation (768D)")
        print("✓ Entry storage")
        print("✓ Semantic search (cosine similarity)")
        print("✓ Cohort health analysis")
        print("✓ Crisis detection")
        print("✓ Emotion anchor validation")
        print("\n" + "="*60 + "\n")
        
        return True
        
    except Exception as e:
        print("\n" + "="*60)
        print("TEST SUITE FAILED ✗")
        print("="*60)
        print(f"\nError: {e}\n")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
