"""
MindEase Integration Service
=============================
Connects the React frontend with the vector database backend.
Handles automatic emotional entry logging and cohort analytics.
"""

import requests
from typing import Dict, Optional
import hashlib
from datetime import datetime


class MindEaseIntegration:
    """
    Integration layer between React frontend and vector database.
    """
    
    def __init__(self, api_base_url: str = "http://localhost:5000"):
        """
        Initialize integration service.
        
        Args:
            api_base_url: Base URL of the Flask API server
        """
        self.api_base_url = api_base_url.rstrip('/')
    
    def log_emotional_entry(
        self,
        user_name: str,
        cohort_id: str,
        vent_text: str,
        mood_label: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> Dict:
        """
        Log an emotional entry from the React app.
        
        Args:
            user_name: User's name (will be hashed)
            cohort_id: User's cohort (e.g., "Engineering_2024")
            vent_text: The emotional expression
            mood_label: Selected mood (e.g., "Anxious", "Overwhelmed")
            session_id: Current session identifier
            
        Returns:
            Response from API
        """
        # Hash user name for anonymity
        user_id = hashlib.sha256(user_name.encode()).hexdigest()[:16]
        
        payload = {
            "user_id": user_id,
            "cohort_id": cohort_id,
            "text": vent_text,
            "metadata": {
                "mood_label": mood_label,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        try:
            response = requests.post(
                f"{self.api_base_url}/api/vent",
                json=payload,
                timeout=5
            )
            return response.json()
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_cohort_health(self, cohort_id: str) -> Dict:
        """
        Get emotional health metrics for a cohort.
        
        Args:
            cohort_id: Cohort identifier
            
        Returns:
            Cohort health data
        """
        try:
            response = requests.get(
                f"{self.api_base_url}/api/cohort/{cohort_id}/health",
                timeout=5
            )
            return response.json()
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def search_emotion(
        self,
        emotion: str,
        threshold: float = 0.8,
        top_k: int = 10
    ) -> Dict:
        """
        Search for users experiencing a specific emotion.
        
        Args:
            emotion: Target emotion (e.g., "anger", "anxiety")
            threshold: Minimum similarity score
            top_k: Maximum results
            
        Returns:
            Search results
        """
        payload = {
            "emotion": emotion,
            "threshold": threshold,
            "top_k": top_k
        }
        
        try:
            response = requests.post(
                f"{self.api_base_url}/api/search/emotion",
                json=payload,
                timeout=5
            )
            return response.json()
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Example usage for React integration
if __name__ == "__main__":
    integration = MindEaseIntegration()
    
    # Example: Log a vent from React
    result = integration.log_emotional_entry(
        user_name="Test User",
        cohort_id="Engineering_2024",
        vent_text="I'm feeling overwhelmed with all these deadlines",
        mood_label="Overwhelmed"
    )
    
    print("Log Result:", result)
    
    # Example: Get cohort health
    health = integration.get_cohort_health("Engineering_2024")
    print("\nCohort Health:", health)
