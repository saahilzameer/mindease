# MindEase Vector Database Integration

## ✅ Integration Complete

The vector database is now **fully integrated** with the React frontend!

---

## 🔗 What's Connected

### 1. **Automatic Emotional Logging**
Every time a user sends a message in the chat:
- ✅ Text is sent to the vector database (`/api/vent`)
- ✅ User ID is hashed for anonymity
- ✅ Mood label and mode are captured as metadata
- ✅ Logging happens **non-blocking** (doesn't interrupt chat)

**Location**: `src/App.jsx` → `logToVectorDB()` function

### 2. **Community Pulse Dashboard**
The Evolution dashboard now shows:
- ✅ **Dominant Emotion**: What the cohort is collectively feeling
- ✅ **Alert Level**: STABLE / MONITOR / WARNING / URGENT
- ✅ **Emotion Profile**: Top 3 emotions with visual bars
- ✅ **Anonymous Count**: Total entries analyzed

**Location**: `src/components/VectorDBInsights.jsx`

---

## 🚀 How to Test

### Step 1: Start the Backend API
```bash
cd backend
python api.py
```

You should see:
```
============================================================
MINDEASE API SERVER
============================================================

✓ Vector Database: 50 entries
✓ CORS: Enabled for React frontend
✓ Endpoints:
  - POST   /api/vent
  - GET    /api/cohort/<id>/health
  ...

Starting server on http://localhost:5000
============================================================
```

### Step 2: Start the React Frontend
```bash
# In a new terminal
npm run dev
```

### Step 3: Test the Integration

1. **Log in** to MindEase
2. **Send a message** in the chat (e.g., "I'm feeling overwhelmed")
3. **Check browser console** - you should see:
   ```
   ✓ Logged to vector DB
   ```
4. **Open Evolution Dashboard** (click "Evolution" in sidebar)
5. **Scroll down** to see "Community Pulse" section

---

## 📊 What You'll See

### In the Evolution Dashboard:

```
┌─────────────────────────────────────┐
│ Community Pulse            WARNING  │
├─────────────────────────────────────┤
│ Collective Mood: burnout            │
├─────────────────────────────────────┤
│ burnout    ████████████░░  78%      │
│ anxiety    ██████████░░░░  75%      │
│ overwhelm  ████████░░░░░░  72%      │
├─────────────────────────────────────┤
│ Based on 50 anonymous entries       │
└─────────────────────────────────────┘
```

---

## 🔍 Behind the Scenes

### When User Sends: "I'm so stressed about finals"

1. **Frontend** (`App.jsx`):
   ```javascript
   logToVectorDB("I'm so stressed about finals")
   ```

2. **API Call**:
   ```
   POST http://localhost:5000/api/vent
   {
     "user_id": "hashed_abc123",
     "cohort_id": "General_2024",
     "text": "I'm so stressed about finals",
     "metadata": {
       "mood_label": "Anxious",
       "mode": "general"
     }
   }
   ```

3. **Backend** (`api.py`):
   - Hashes user ID again (double anonymization)
   - Generates 768D embedding via Gemini
   - Stores in ChromaDB with cosine similarity

4. **Vector DB** (`vector_db.py`):
   - Compares to 7 emotional anchors
   - Updates cohort centroid
   - Calculates alert level

5. **Dashboard** (`VectorDBInsights.jsx`):
   - Fetches cohort health every mount
   - Displays dominant emotion
   - Shows top 3 emotions with bars

---

## 🛡️ Privacy Safeguards

### Double Anonymization
1. **Frontend**: User name → SHA-256 hash
2. **Backend**: Hash again before storage
3. **Result**: Even if DB is compromised, identity is protected

### Non-Blocking Logging
```javascript
try {
    await fetch('/api/vent', { ... })
} catch (error) {
    // Silently fail - user experience continues
    console.log('Vector DB logging skipped (server offline)')
}
```

If the backend is offline, the app **still works perfectly**.

---

## 📈 Data Flow Diagram

```
User Types Message
       ↓
   App.jsx (processInput)
       ↓
   logToVectorDB() ──────→ POST /api/vent
       ↓                         ↓
   Continue Chat          api.py (Flask)
   (Non-blocking)               ↓
                         vector_db.py
                                ↓
                         ChromaDB Storage
                                ↓
                         Semantic Analysis
                                ↓
   VectorDBInsights.jsx ← GET /api/cohort/health
       ↓
   Evolution Dashboard
   (Community Pulse)
```

---

## 🎯 Key Features Enabled

### 1. Semantic Search
```javascript
// Find users experiencing high anxiety
fetch('/api/search/emotion', {
    method: 'POST',
    body: JSON.stringify({
        emotion: 'anxiety',
        threshold: 0.8,
        top_k: 10
    })
})
```

### 2. Cohort Health Monitoring
```javascript
// Get Engineering cohort health
fetch('/api/cohort/Engineering_2024/health')
```

### 3. Crisis Detection (Admin Only)
```javascript
// Check for users needing intervention
fetch('/api/crisis/check')
```

---

## 🔧 Configuration

### Change Default Cohort
In `src/App.jsx`, line ~190:
```javascript
cohort_id: 'General_2024', // Change to 'Engineering_2024', etc.
```

### Adjust Logging Frequency
Currently logs **every message**. To throttle:
```javascript
const logToVectorDB = async (text) => {
    // Only log if message is longer than 10 characters
    if (text.length < 10) return;
    
    // Rest of function...
}
```

---

## 🐛 Troubleshooting

### "Vector DB logging skipped (server offline)"
**Solution**: Start the backend API server
```bash
cd backend
python api.py
```

### CORS Error
**Solution**: Ensure Flask server has CORS enabled (already done in `api.py`)

### No Community Pulse Showing
**Solution**: 
1. Check backend is running
2. Open browser console for errors
3. Verify at least 1 entry exists in DB

---

## 📚 Files Modified/Created

### Frontend Integration
- ✅ `src/App.jsx` - Added `logToVectorDB()` function
- ✅ `src/components/VectorDBInsights.jsx` - New component
- ✅ `src/components/VectorDBInsights.css` - Styling
- ✅ `src/components/WellnessDashboard.jsx` - Integrated insights

### Backend Files
- ✅ `backend/vector_db.py` - Core database
- ✅ `backend/api.py` - Flask REST API
- ✅ `backend/integration.py` - Helper functions
- ✅ `backend/test_vector_db.py` - Test suite

---

## ✨ Next Steps

1. ✅ **Test the integration** (follow steps above)
2. 🔄 **Customize cohort IDs** based on user profiles
3. 🚀 **Deploy to production** (Pinecone + authentication)
4. 📊 **Add admin dashboard** for crisis monitoring

---

**The vector database is now live and capturing emotional data! 🎉**
