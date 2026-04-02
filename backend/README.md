# FitVerse Backend - Setup & Architecture Guide

## 📋 Project Overview

FitVerse is an AI-powered virtual fitting room platform that:
1. **Analyzes user photos** to extract body measurements and body type
2. **Generates personalized avatars** with estimated measurements and skin tone
3. **Predicts garment fit** and provides tailored recommendations

This is the backend component built with **Python FastAPI**.

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Run the Server

```bash
python app.py
```

Server will start at `http://localhost:8000`

### Step 3: Test the API

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI)

---

## 📁 Project Structure

```
backend/
├── app.py                      # FastAPI main application
├── config.py                   # Configuration settings
├── requirements.txt            # Python dependencies
│
├── database/
│   ├── models.py              # SQLAlchemy ORM models
│   ├── garments_db.json       # Sample garment database
│   └── fitverse.db            # SQLite database (auto-created)
│
├── ml/
│   ├── body_analyzer.py       # MediaPipe pose detection
│   ├── body_classifier.py     # Body type classification
│   └── skin_tone.py           # Skin tone analysis
│
├── utils/
│   └── fit_engine.py          # Garment fit prediction logic
│
├── api/
│   └── __init__.py            # API routes (expandable)
│
└── uploads/                    # User uploaded images directory
```

---

## 🔌 API Endpoints

### 1. **Analyze Body from Photo**
```http
POST /api/v1/analyze-body
```

Upload user photo to analyze body measurements, body type, and skin tone.

**Request:**
- `file`: Image file (JPG, PNG)
- `email`: User email (optional)

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

### 2. **Predict Garment Fit**
```http
POST /api/v1/predict-fit
```

Predict how well a garment will fit user.

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

### 3. **Get Garments**
```http
GET /api/v1/garments
```

Get all available garments with specifications.

### 4. **Get User Measurements**
```http
GET /api/v1/measurement/{measurement_id}
```

Retrieve stored user measurements.

---

## 🧠 ML Pipeline Explained

### Phase 1: Body Analysis

```python
# 1. Pose Detection (MediaPipe)
BodyAnalyzer.analyze_image(image_path)
    → Extracts 33 pose keypoints
    → Calculates body proportions
    → Returns measurements in pixels

# 2. Height Estimation
HeightEstimator.estimate_height_from_proportions(measurements)
    → Uses leg-to-torso ratio
    → Compares to standard human proportions
    → Returns estimated height in cm

# 3. Body Type Classification
BodyTypeClassifier.classify(measurements, height)
    → Analyzes shoulder-to-hip ratio
    → Checks leg-to-torso proportions
    → Returns body type + confidence
    → Generates full measurement estimates

# 4. Skin Tone Analysis
SkinToneAnalyzer.analyze_image(image_path)
    → Detects face region
    → Extracts dominant skin color
    → Converts to HSL color space
    → Returns for avatar generation
```

### Phase 2: Fit Prediction

```python
FitEngine.predict_fit(user_measurements, garment, size)
    
    → Length Check: Compares garment length vs. user body length
    → Width Check: Compares chest/waist width vs. garment specs
    → Proportional Check: Matches body type to garment target audience
    → Overall Score: Weighted average of 3 metrics
    → Issues Identification: Lists specific fit problems
    → Recommendations: Suggests alternatives or sizing adjustments
```

---

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
