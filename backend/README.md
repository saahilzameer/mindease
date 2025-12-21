# MindEase Backend - Vector Database

This directory contains the vector database architecture for semantic emotional analysis.

## Architecture Overview

### Components
1. **ChromaDB**: Local vector database with cosine similarity indexing
2. **Google Generative AI**: Embedding generation (768-dimensional vectors)
3. **Emotional Seed Vectors**: Pre-computed anchor phrases for 7 core emotions
4. **Ethical Glass Box**: Anonymity-first design with crisis de-masking

### Core Features

#### 1. Semantic Emotional Search
- **Function**: `get_top_emotions(target_emotion, threshold, top_k)`
- **Purpose**: Find users whose emotional state matches a target emotion
- **Anonymity**: Returns only `cohort_id` and `similarity_score`

#### 2. Cohort Health Analysis
- **Function**: `analyze_cohort_health(cohort_id)`
- **Purpose**: Calculate emotional centroid of a group
- **Use Case**: Detect systemic issues (e.g., difficult exam period)

#### 3. Crisis Detection
- **Function**: `flag_for_human_intervention()`
- **Purpose**: Identify users requiring immediate help
- **De-masking Rule**: ONLY reveals identity if `similarity > 0.9` to crisis anchor

### Emotional Anchors

```python
{
    "anger": "I am furious, I want to scream, everything is unfair.",
    "sadness": "I feel empty, alone, and like I can't keep going.",
    "anxiety": "My heart is racing, I can't breathe, I'm going to fail.",
    "burnout": "I'm exhausted, nothing matters anymore, I can't do this.",
    "loneliness": "Nobody understands me, I'm completely isolated.",
    "overwhelm": "Everything is too much, I'm drowning.",
    "crisis": "I don't want to exist anymore, there's no way out."
}
```

## Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
Create a `.env` file in the `backend` directory:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

### 3. Run Demonstration
```bash
python vector_db.py
```

This will:
- Initialize ChromaDB
- Generate 50 simulation entries (20 Engineering, 20 Arts, 10 High Anger)
- Run 4 demonstration queries
- Display results with anonymity preserved

## Usage Examples

### Find High-Risk Users
```python
from vector_db import MindEaseVectorDB

db = MindEaseVectorDB()

# Find users experiencing high anxiety
anxious_users = db.get_top_emotions(
    target_emotion="anxiety",
    threshold=0.8,
    top_k=10
)

for user in anxious_users:
    print(f"Cohort: {user['cohort_id']}, Risk: {user['risk_level']}")
```

### Monitor Cohort Trends
```python
# Analyze Engineering cohort
health = db.analyze_cohort_health("Engineering_2024")

if health['alert_level'] == 'WARNING':
    print(f"⚠️ Cohort showing elevated {health['dominant_emotion']}")
```

### Crisis Intervention
```python
# Check for users needing immediate help
crisis_cases = db.flag_for_human_intervention(
    similarity_threshold=0.9
)

# Only these cases reveal user_id for counselor contact
for case in crisis_cases:
    notify_counselor(case['user_id'], case['crisis_similarity'])
```

## Ethical Safeguards

### Anonymity Layers
1. **Default State**: All queries return only `cohort_id` and scores
2. **User IDs**: Pre-hashed before storage
3. **Text Storage**: Only 50-character previews stored
4. **Crisis Gate**: Strict threshold (>0.9 similarity) for identity reveal

### Glass Box Transparency
- Admins see aggregate trends, not individuals
- Cohort centroids enable systemic interventions
- Crisis detection is rule-based and auditable

## Data Flow

```
User Vent → Embedding (768D) → ChromaDB → Semantic Search
                                    ↓
                            Cohort Analysis
                                    ↓
                            Alert System (if needed)
```

## Performance

- **Embedding Generation**: ~200ms per text
- **Vector Search**: <50ms for 1000 entries
- **Cohort Analysis**: ~500ms for 50-entry cohort
- **Storage**: ~1KB per entry (embedding + metadata)

## Production Considerations

### Scaling to Pinecone
For production deployment, replace ChromaDB with Pinecone:

```python
import pinecone

pinecone.init(api_key="your_key", environment="us-west1-gcp")
index = pinecone.Index("mindease-emotions")

# Same interface, cloud-scale performance
```

### Privacy Compliance
- GDPR: Right to deletion implemented via `user_id` removal
- FERPA: Student data encrypted at rest
- Audit Logs: All crisis de-masking events logged

## Testing

Run the simulation to verify:
1. ✓ Semantic search accuracy
2. ✓ Cohort centroid calculation
3. ✓ Crisis detection threshold
4. ✓ Anonymity preservation

## Support

For questions or issues, refer to the main MindEase documentation.
