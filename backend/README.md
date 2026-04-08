# StyleFit Studio - Backend API

[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite-blue.svg)](https://www.sqlite.org)

## 📋 Overview

The StyleFit Studio backend is a **FastAPI-based REST API** that provides:
- **AI Body Analysis** - Extracting body measurements from photos using MediaPipe
- **Body Type Classification** - ML-based classification of body types
- **Garment Fit Prediction** - Intelligent fit predictions and recommendations
- **Skin Tone Detection** - Accurate skin tone extraction for avatar generation

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

### Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

**Server runs at:** `http://localhost:8000`

**API Docs:** `http://localhost:8000/docs` (Swagger UI)

**Alternative Docs:** `http://localhost:8000/redoc` (ReDoc)

---

## 📦 Requirements

See [requirements.txt](requirements.txt) for full dependency list:

- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **sqlalchemy** - ORM
- **mediapipe** - Pose detection
- **scikit-learn** - ML models
- **scikit-image** - Image processing
- **pillow** - Image manipulation
- **numpy** - Numerical computing
- **opencv-python** - Computer vision

---

## 📁 Project Structure

```
backend/
├── app.py                      # FastAPI application entry point
├── config.py                   # Configuration management
├── requirements.txt            # Python dependencies
│
├── database/
│   ├── __init__.py
│   ├── models.py              # SQLAlchemy ORM models
│   │   ├── User
│   │   ├── BodyMeasurement
│   │   ├── Garment
│   │   └── FitPrediction
│   └── garments_db.json       # Sample garment specifications
│
├── ml/                         # Machine Learning modules
│   ├── __init__.py
│   ├── body_analyzer.py       # Body measurement extraction
│   ├── body_classifier.py     # Body type classification model
│   ├── skin_tone.py           # Skin tone analysis
│   └── models/                # Pre-trained ML models (optional)
│
├── utils/                      # Utility modules
│   ├── __init__.py
│   ├── color_engine.py        # Color matching & recommendations
│   ├── fit_engine.py          # Core fit prediction logic
│   ├── fit_engine_advanced.py # Advanced fitting algorithms
│   ├── fit_engine_hybrid.py   # Hybrid prediction model
│   ├── style_engine.py        # Style recommendations
│   └── validation.py          # Input validation
│
├── api/                        # API route handlers
│   ├── __init__.py
│   └── routes/
│       ├── analysis.py        # Body analysis endpoints
│       ├── prediction.py      # Fit prediction endpoints
│       ├── garments.py        # Garment database endpoints
│       └── health.py          # Health check endpoints
│
└── uploads/                    # Temporary user upload storage
    └── .gitkeep
```

---

## 🔌 API Endpoints

### 1. Body Analysis
```http
POST /api/v1/analyze-body
```
Extract body measurements, body type, and skin tone from a user photo.

**Request:**
```json
{
  "file": "<image_file>",
  "email": "user@example.com"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "measurement_id": 1,
  "body_analysis": {
    "body_type": "average",
    "confidence": 0.82,
    "skin_tone_hsl": "25 55% 72%",
    "analysis_confidence": 0.78
  },
  "measurements": {
    "height": 165.5,
    "bust": 88.3,
    "waist": 70.2,
    "hips": 92.1,
    "shoulder_width": 41.4,
    "inseam": 78.2
  }
}
```

### 2. Fit Prediction
```http
POST /api/v1/predict-fit
```
Predict how well a garment will fit a user's measurements.

**Request:**
```json
{
  "measurement_id": 1,
  "garment_id": "zara_tshirt_001",
  "selected_size": "M"
}
```

**Response:**
```json
{
  "success": true,
  "fit_prediction": {
    "overall_fit_score": 82,
    "fit_quality": "Good fit",
    "fit_breakdown": {
      "length": 78,
      "width": 85,
      "proportional": 72
    },
    "issues": [],
    "recommendations": {
      "should_buy": true,
      "suggestions": ["This garment should fit you well!"]
    }
  }
}
```

### 3. Get Garments
```http
GET /api/v1/garments
```
Retrieve all available garments.

**Query Parameters:**
- `category` - Filter by category
- `size` - Filter by size
- `skip` - Pagination skip (default: 0)
- `limit` - Pagination limit (default: 50)

**Response:**
```json
{
  "success": true,
  "total": 150,
  "garments": [
    {
      "id": "zara_tshirt_001",
      "name": "Classic T-Shirt",
      "category": "shirt",
      "sizes": ["XS", "S", "M", "L", "XL"],
      "measurements": {
        "S": {"length": 65, "chest": 44, "sleeve": 18}
      },
      "price": 29.99,
      "image_url": "/images/zara_tshirt_001.jpg"
    }
  ]
}
```

### 4. Get User Measurements
```http
GET /api/v1/measurements/{measurement_id}
```
Retrieve stored user measurements.

**Response:**
```json
{
  "success": true,
  "measurement": {
    "id": 1,
    "user_email": "user@example.com",
    "height": 165.5,
    "bust": 88.3,
    "waist": 70.2,
    "hips": 92.1,
    "body_type": "average",
    "skin_tone_hsl": "25 55% 72%",
    "created_at": "2026-04-08T10:30:00Z"
  }
}
```

### 5. Health Check
```http
GET /api/v1/health
```
API health status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-04-08T10:30:00Z"
}
```

---

## 🧠 ML Pipeline

### Body Analysis Pipeline

```
User Photo
    ↓
1. MediaPipe Pose Detection
   ├── Extract 33 pose keypoints
   ├── Normalize keypoints
   └── Calculate body proportions
    ↓
2. Body Measurement Extraction
   ├── Estimate height from proportions
   ├── Calculate shoulder width
   ├── Estimate bust/waist/hip measurements
   └── Validate against human anatomy
    ↓
3. Body Type Classification
   ├── Analyze shoulder-to-hip ratio
   ├── Check leg-to-torso proportions
   ├── Apply ML classifier (RandomForest)
   └── Return body type + confidence
    ↓
4. Skin Tone Analysis
   ├── Detect face region
   ├── Extract dominant color
   ├── Convert to HSL color space
   └── Return for avatar generation
    ↓
5. Database Storage
   └── Store measurements with metadata
```

### Fit Prediction Engine

```
User Measurements + Garment Specs
    ↓
1. Measurement Validation
   ├── Verify available measurements
   ├── ValidateSize compatibility
   └── Check confidence scores
    ↓
2. Length Analysis
   ├── Compare garment length to user height
   ├── Consider inseam for bottoms
   └── Calculate length fit score
    ↓
3. Width Analysis
   ├── Compare chest/bust width
   ├── Compare waist width
   ├── Compare hip width
   └── Calculate width fit score
    ↓
4. Proportional Analysis
   ├── Match body type to garment target
   ├── Consider brand size standards
   └── Calculate proportional fit score
    ↓
5. Final Prediction
   ├── Weighted average of scores
   ├── Identify specific fit issues
   ├── Generate recommendations
   └── Return fit prediction
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./fitverse.db

# API Settings
DEBUG=False
ENVIRONMENT=production

# CORS Settings
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com

# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads

# ML Models
MODEL_CACHE_DIR=./models
```

### app.py Configuration

Key configuration options in `config.py`:

```python
class Settings:
    # Database
    DATABASE_URL: str
    SQLALCHEMY_ECHO: bool = False
    
    # API
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    
    # CORS
    ALLOWED_ORIGINS: List[str]
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
python -m pytest

# Run with verbose output
python -m pytest -v

# Run specific test file
python -m pytest tests/test_api.py

# Run with coverage
python -m pytest --cov=. --cov-report=html
```

### Test Structure

```
tests/
├── test_api.py           # API endpoint tests
├── test_ml.py            # ML pipeline tests
├── test_body_analyzer.py # Body analyzer tests
├── test_fit_engine.py    # Fit prediction tests
└── fixtures.py           # Test fixtures & mocks
```

---

## 📊 Database Setup

### Initialize Database

The database is automatically created on first run. To reset:

```bash
# Remove existing database
rm fitverse.db

# Restart server - new database will be created
python app.py
```

### Database Schema

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE body_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    height FLOAT,
    bust FLOAT,
    waist FLOAT,
    hips FLOAT,
    shoulder_width FLOAT,
    inseam FLOAT,
    body_type VARCHAR(50),
    skin_tone_hsl VARCHAR(50),
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE garments (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    brand VARCHAR(100),
    measurements JSON,
    price FLOAT,
    image_url TEXT
);

CREATE TABLE fit_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    measurement_id INTEGER,
    garment_id VARCHAR(100),
    fit_score FLOAT,
    fit_quality VARCHAR(50),
    recommendations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (measurement_id) REFERENCES body_measurements (id),
    FOREIGN KEY (garment_id) REFERENCES garments (id)
);
```

---

## 🚀 Deployment

### Deploy to Production

#### Using Gunicorn

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

#### Using Docker

```bash
# Build image
docker build -t stylefit-backend .

# Run container
docker run -p 8000:8000 stylefit-backend
```

#### Environment Variables for Production

```env
DEBUG=False
ENVIRONMENT=production
DATABASE_URL=postgresql://user:password@host/dbname
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 🔐 Security Best Practices

1. **Input Validation**
   - All inputs validated with Pydantic models
   - File upload size limits enforced
   - Type checking enabled

2. **File Handling**
   - Uploaded files stored temporarily
   - Automatic cleanup after processing
   - Virus scanning recommended for production

3. **Database**
   - SQL injection prevention via ORM
   - Connection pooling configured
   - Backups recommended for production

4. **API Security**
   - CORS whitelist configured
   - Rate limiting recommended
   - Authentication/Authorization ready for implementation

---

## 📈 Performance Optimization

- **Caching** - Database query caching implemented
- **Async** - Async route handlers for I/O operations
- **Model Optimization** - Efficient ML models with reduced memory footprint
- **Image Processing** - Optimized image handling with PIL
- **Database Indexes** - Key columns indexed for fast queries

---

## 🐛 Troubleshooting

### Issue: PORT 8000 Already in Use

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### Issue: MediaPipe Not Installing

```bash
# Install specific version
pip install mediapipe==0.9.3.0
```

### Issue: Database Error

```bash
# Remove corrupt database
rm fitverse.db

# Restart server
python app.py
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [MediaPipe Guide](https://developers.google.com/mediapipe)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org)
- [scikit-learn Documentation](https://scikit-learn.org)

---

## 📝 API Usage Examples

### Example 1: Complete Body Analysis Workflow

```python
import requests
from pathlib import Path

# 1. Upload photo for analysis
with open("user_photo.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:8000/api/v1/analyze-body",
        files={"file": f},
        data={"email": "user@example.com"}
    )
    
result = response.json()
measurement_id = result["measurement_id"]
print(f"Measurement ID: {measurement_id}")
print(f"Body Type: {result['body_analysis']['body_type']}")

# 2. Get garments
garments_response = requests.get(
    "http://localhost:8000/api/v1/garments",
    params={"category": "shirt", "limit": 10}
)

# 3. Predict fit for selected garment
for garment in garments_response.json()["garments"]:
    fit_response = requests.post(
        "http://localhost:8000/api/v1/predict-fit",
        json={
            "measurement_id": measurement_id,
            "garment_id": garment["id"],
            "selected_size": "M"
        }
    )
    
    fit_data = fit_response.json()
    if fit_data["fit_prediction"]["should_buy"]:
        print(f"✅ {garment['name']} - Score: {fit_data['fit_prediction']['overall_fit_score']}")
    else:
        print(f"❌ {garment['name']} - Not recommended")
```

---

## 📞 Support & Contributions

For issues, questions, or contributions, please refer to the main [CONTRIBUTING.md](../CONTRIBUTING.md) guide.

---

**Backend Last Updated:** April 2026  
**Version:** 1.0.0  
**Python Version:** 3.9+

## 📊 Body Type Classification Logic

| Body Type   | Criteria                              | Typical Brands       |
|-----------|---------------------------------------|---------------------|
| **Slim**    | Narrow shoulders, long legs           | ASOS, H&M Slim       |
| **Average** | Balanced proportions                  | Zara, Uniqlo         |
| **Athletic**| Broad shoulders, defined              | Nike, Adidas         |
| **Muscular**| Very broad, muscular build            | Gym brands           |
| **Curvy**   | Fuller hips than bust                 | Fashion Nova, ASOS   |
| **Plus-Size**| Larger overall measurements           | Torrid, Old Navy     |
| **Petite**  | Short height with proportional scaling| Petite brands        |
| **Tall**    | Tall height, long limbs               | Tall brands          |

---

## 🎨 Skin Tone Matching

The system analyzes skin tone in HSL format:
- **Hue** (0-360°): Warm tone (red/orange/yellow)
- **Saturation** (0-100%): Color intensity
- **Lightness** (0-100%): Brightness

**Examples:**
- Porcelain: `30 80% 92%`
- Fair: `28 65% 82%`
- Medium: `22 50% 62%`
- Brown: `18 40% 42%`
- Deep: `14 30% 22%`

---

## 📦 Database Schema

### Users Table
```
id, email, username, created_at
```

### UserMeasurements Table
```
id, user_id,
height, bust, waist, hips, inseam, shoulder_width,
body_type, skin_tone_hsl,
source_image_path, analysis_confidence,
created_at, updated_at
```

### Garments Table
```
id, name, brand, category, price, fabric, stretch_percentage,
image_url, fit_notes,
specifications (JSON), target_body_types (JSON),
created_at
```

### FitPredictions Table
```
id, measurement_id, garment_id,
overall_fit_score, length_fit, width_fit, proportional_fit,
fit_issues (JSON), recommendations (JSON),
created_at
```

---

## 🛠️ Customization & Extension

### Adding More Garments

Edit `backend/database/garments_db.json`:

```json
{
  "id": "brand_item_001",
  "name": "Item Name",
  "brand": "Brand",
  "category": "tops|bottoms|dresses|outerwear",
  "price": 49.99,
  "fabric": "100% Cotton",
  "stretch_percentage": 5,
  "image_url": "https://...",
  "specifications": {
    "sizes": {
      "XS": {
        "chest_width": 35,
        "length": 62,
        ...
      }
    }
  },
  "target_body_types": ["average", "slim"],
  "fit_notes": "True to size"
}
```

### Improving Height Estimation

Currently uses ratio-based estimation. For production, add:
1. Reference object detection (dollar bill, credit card)
2. Camera focal length / distance calculation
3. Fine-tuned ML model on annotated height data

### Fine-tuning Body Classification

Train a lightweight ML model:
```python
from sklearn.ensemble import RandomForestClassifier

# Collect training data with labeled body types
X_train = [measurements_features]  # Proportions
y_train = [body_types]             # Labels

model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Use in BodyTypeClassifier
```

---

## ⚙️ Performance Optimization

### Image Processing
- Resize images to 800x800 before processing (~3x faster)
- Use async file uploads for better concurrency
- Cache model loads (MediaPipe, ML models)

### Database
- Index on `user_id`, `garment_id`, `body_type`
- Cache garments_db.json in memory after first load
- Use database connection pooling

### ML Inference
- TensorFlow Lite for lighter model inference
- Batch processing for multiple fit predictions
- GPU acceleration (CUDA) if available

---

## 🧪 Testing the Backend

### Using cURL

```bash
# Analyze body
curl -X POST "http://localhost:8000/api/v1/analyze-body" \
  -F "file=@path/to/image.jpg" \
  -F "email=user@example.com"

# Predict fit
curl -X POST "http://localhost:8000/api/v1/predict-fit" \
  -H "Content-Type: application/json" \
  -d '{
    "measurement_id": 1,
    "garment_id": "zara_tshirt_001",
    "selected_size": "M"
  }'

# List garments
curl "http://localhost:8000/api/v1/garments"
```

### Using Python Requests

```python
import requests

# Upload and analyze
with open('photo.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/v1/analyze-body',
        files={'file': f},
        data={'email': 'user@example.com'}
    )
    print(response.json())
```

---

## 📝 Integration with Frontend

Your React app should:

1. **Upload photo** → Call `/analyze-body` → Get `measurement_id` + measurements
2. **Display avatar** → Use returned `skin_tone_hsl`, body type, measurements
3. **Select garment** → Call `/predict-fit` → Display fit score & recommendations
4. **Show results** → Display garment with fit quality badge

---

## 🚨 Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "No pose detected" | Body not fully visible | Request full-body photo |
| "Model not found" | Missing garment ID | Check garments_db.json |
| "Too short/long" | Image quality issue | Request better lit, clear photo |
| Connection timeout | Server not running | Start backend: `python app.py` |

---

## 📚 Future Improvements (Production)

1. **User Authentication** - JWT tokens, user profiles
2. **Payment Integration** - Stripe for garment purchases
3. **Real-time Collaboration** - WebSockets for live fittings
4. **Advanced ML Models** - 3D body reconstruction, virtual try-on
5. **Garment Image API** - Integration with Zara, H&M APIs
6. **Analytics** - Fit prediction accuracy, user preferences
7. **Mobile App** - Native iOS/Android client
8. **3D Rendering** - Real-time garment simulation

---

## 📞 Support & Questions

For issues or questions, check:
- API docs: http://localhost:8000/docs
- This README
- Code comments in `ml/`, `utils/` modules

Happy fitting! 🎉
