# MindEase Vector Database Architecture

## 🎯 Overview

A complete **semantic emotional analysis system** for MindEase using:
- **ChromaDB**: Local vector database with cosine similarity
- **Google Generative AI**: 768-dimensional embeddings
- **Ethical Glass Box**: Anonymity-first with crisis de-masking

---

## 📁 File Structure

```
backend/
├── vector_db.py           # Core vector database implementation
├── api.py                 # Flask REST API server
├── test_vector_db.py      # Comprehensive test suite
├── requirements.txt       # Python dependencies
├── .env                   # API key configuration
├── .env.example          # Template for .env
├── README.md             # Architecture documentation
├── SETUP.md              # Installation & testing guide
└── mindease_chromadb/    # ChromaDB storage (auto-created)
```

---

## 🚀 Quick Start

### 1. Install Python
Ensure Python 3.8+ is installed:
```bash
python --version
```

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure API Key
The `.env` file should already contain your Gemini API key. Verify:
```bash
cat .env
```

### 4. Run Demonstration
```bash
python vector_db.py
```

**Expected Output:**
- ✓ 50 simulation entries generated
- ✓ 4 demonstration queries executed
- ✓ Results showing anonymity preservation

---

## 🧪 Run Tests

```bash
python test_vector_db.py
```

**Tests Include:**
1. Database initialization
2. Embedding generation (768D)
3. Entry storage
4. Semantic search
5. Cohort health analysis
6. Crisis detection
7. Emotion anchor validation

---

## 🌐 Start API Server

```bash
python api.py
```

Server runs on `http://localhost:5000`

**Available Endpoints:**
- `POST /api/vent` - Add emotional entry
- `GET /api/cohort/<id>/health` - Cohort analysis
- `POST /api/search/emotion` - Semantic search
- `GET /api/crisis/check` - Crisis detection (ADMIN)
- `GET /api/emotions/anchors` - List emotion anchors
- `GET /api/stats` - Database statistics

---

## 📊 Key Features

### 1. Semantic Emotional Search
```python
# Find users experiencing high anxiety
results = db.get_top_emotions(
    target_emotion="anxiety",
    threshold=0.8,
    top_k=10
)
```

**Returns:**
- `cohort_id` (anonymous)
- `similarity_score` (0-1)
- `risk_level` (LOW/MODERATE/HIGH/CRITICAL)

### 2. Cohort Health Analysis
```python
# Analyze Engineering cohort
health = db.analyze_cohort_health("Engineering_2024")
```

**Returns:**
- Dominant emotion
- Emotion profile (7 dimensions)
- Alert level (STABLE/MONITOR/WARNING/URGENT)

### 3. Crisis Detection
```python
# Flag users needing intervention
flagged = db.flag_for_human_intervention(
    similarity_threshold=0.9
)
```

**⚠️ ONLY scenario where user identity is revealed**

---

## 🔒 Ethical Safeguards

### Anonymity Layers
1. **User IDs**: SHA-256 hashed before storage
2. **Text Previews**: Only 50 characters stored
3. **Default Queries**: Return only `cohort_id` and scores
4. **Crisis Gate**: Strict threshold (>0.9) for identity reveal

### Glass Box Transparency
- Admins see **cohort trends**, not individuals
- Centroid analysis enables **systemic interventions**
- Crisis detection is **rule-based and auditable**

---

## 📈 Simulation Data

The demonstration generates **50 dummy entries**:

| Cohort | Count | Emotional Lean |
|--------|-------|----------------|
| Engineering_2024 | 20 | Stress/Burnout |
| Arts_2024 | 20 | Loneliness/Creativity |
| High Anger (mixed) | 10 | Anger/Frustration |

---

## 🎯 Example Queries

### Find 3 Most Angry Users
```python
angry_users = db.get_top_emotions("anger", threshold=0.7, top_k=3)

# Output:
# 1. Cohort: Engineering_2024, Similarity: 0.8734 (HIGH)
# 2. Cohort: Arts_2024, Similarity: 0.8521 (HIGH)
# 3. Cohort: Engineering_2024, Similarity: 0.8412 (HIGH)
```

### Cohort Health Check
```python
health = db.analyze_cohort_health("Engineering_2024")

# Output:
# Dominant Emotion: BURNOUT
# Alert Level: WARNING
# Emotion Profile:
#   Burnout: 0.7823
#   Anxiety: 0.7456
#   Overwhelm: 0.7234
```

---

## 🔧 Troubleshooting

### Python Not Found
Install from [python.org](https://www.python.org/downloads/) and check "Add to PATH"

### API Key Error
Verify `backend\.env` contains:
```
VITE_GEMINI_API_KEY=your_actual_key_here
```

### Import Errors
```bash
pip install --upgrade -r requirements.txt
```

### Rate Limit (429)
Wait a few minutes or use a different API key

---

## 📚 Documentation

- **SETUP.md**: Detailed installation guide with expected outputs
- **README.md**: Architecture and API documentation
- **Code Comments**: Inline documentation in all Python files

---

## 🚀 Production Deployment

### Scale to Pinecone
Replace ChromaDB with Pinecone for cloud scale:

```python
import pinecone

pinecone.init(api_key="your_key", environment="us-west1-gcp")
index = pinecone.Index("mindease-emotions")
```

### Add Authentication
Protect admin endpoints:

```python
from functools import wraps

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not verify_admin_token(token):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/crisis/check')
@require_admin
def check_crisis_flags():
    # ...
```

---

## 📊 Performance Benchmarks

| Operation | Time | Scale |
|-----------|------|-------|
| Embedding Generation | ~200ms | Per entry |
| Vector Search | <50ms | 1000 entries |
| Cohort Analysis | ~500ms | 50-entry cohort |
| Crisis Detection | ~300ms | Full scan |

---

## 🎓 Educational Value

This implementation demonstrates:
- ✅ Semantic similarity using embeddings
- ✅ Vector database operations (ChromaDB)
- ✅ Ethical AI design (anonymity + crisis detection)
- ✅ RESTful API design (Flask)
- ✅ Test-driven development

---

## 📝 Next Steps

1. ✅ Run `python vector_db.py` to see the demo
2. ✅ Run `python test_vector_db.py` to validate
3. ✅ Run `python api.py` to start the server
4. 🔄 Integrate with React frontend
5. 🚀 Deploy to production (Pinecone + Auth)

---

## 📞 Support

For issues or questions:
1. Check **SETUP.md** for installation help
2. Review **README.md** for API documentation
3. Examine code comments for implementation details

---

## ✨ Key Achievements

✅ **Vector Database**: ChromaDB with cosine similarity  
✅ **Semantic Search**: 7 emotional anchors  
✅ **Cohort Analysis**: Centroid-based health metrics  
✅ **Crisis Detection**: Ethical de-masking at >0.9 threshold  
✅ **API Server**: Flask REST endpoints  
✅ **Test Suite**: 7 comprehensive tests  
✅ **Simulation Data**: 50 realistic entries  
✅ **Documentation**: Complete setup and usage guides  

---

**Built with ❤️ for MindEase - Ethical AI for Student Wellness**
