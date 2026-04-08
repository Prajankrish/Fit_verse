# Architecture Guide - StyleFit Studio

## 🏗️ System Overview

StyleFit Studio is a full-stack application with a clear separation between frontend and backend:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React/TypeScript)                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Components | Pages | Hooks | Context | Utils            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓↑ HTTP/REST                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              3D Rendering (Three.js)                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                             ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                  Backend (Python FastAPI)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ API Routes | ML Models | Database | Utilities           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓↑                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ MediaPipe | scikit-learn | SQLite | Image Processing    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Frontend Architecture

### Directory Structure
```
src/
├── components/              # Reusable React components
│   ├── AIAvatarGenerator.tsx         # Avatar creation component
│   ├── AIStylistContextBar.tsx       # AI stylist interface
│   ├── AppNavbar.tsx                 # Navigation component
│   ├── AvatarViewer.tsx              # 3D avatar viewer
│   ├── BodyAnalysisResults.tsx       # Analysis display
│   ├── ClothingCard.tsx              # Clothing item card
│   ├── ColorRecommendationCard.tsx   # Color recommendations
│   ├── FitAnalysisPanel.tsx          # Fit analysis display
│   ├── FitPredictionCard.tsx         # Prediction results
│   ├── FitPredictionModal.tsx        # Prediction modal dialog
│   ├── FitPredictionSystem.tsx       # Fit system orchestrator
│   ├── FloatingAvatarPanel.tsx       # Floating UI panel
│   ├── GarmentGrid.tsx               # Clothing grid display
│   └── ...more components
│
├── pages/                   # Page-level components
│   ├── HomePage.tsx
│   ├── AvatarPage.tsx
│   ├── ClothingPage.tsx
│   └── ...pages
│
├── hooks/                   # Custom React hooks
│   ├── useAvatar.ts         # Avatar state management
│   ├── useBodyMeasurements.ts
│   ├── useFitPrediction.ts
│   └── ...custom hooks
│
├── contexts/                # React Context API
│   ├── AvatarContext.tsx    # Avatar state context
│   ├── UserContext.tsx      # User data context
│   └── ...contexts
│
├── utils/                   # Utility functions
│   ├── api.ts              # API client functions
│   ├── constants.ts        # Constants and configs
│   ├── helpers.ts          # Helper functions
│   ├── validation.ts       # Form validation
│   └── ...utils
│
├── lib/                     # Library functions
│   ├── three-setup.ts      # Three.js initialization
│   ├── avatar-loader.ts    # Avatar model loading
│   └── ...libs
│
├── assets/                  # Static assets
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── models/             # 3D models
│
├── App.tsx                  # Main App component
├── App.css                  # Global styles
├── main.tsx                 # React DOM render
├── index.css                # Global CSS
└── vite-env.d.ts           # Vite type definitions
```

### Component Hierarchy

```
<App>
├── <AppNavbar />
├── <Router>
│   ├── <HomePage>
│   │   └── <FeatureCard />
│   ├── <AvatarPage>
│   │   ├── <AIAvatarGenerator />
│   │   └── <AvatarViewer />
│   ├── <ClothingPage>
│   │   ├── <GarmentGrid />
│   │   └── <ClothingCard />
│   └── <FitPredictionPage>
│       └── <FitPredictionSystem />
├── <AIStylistContextBar />
└── <FloatingAvatarPanel />
```

### Data Flow

```
User Input
    ↓
Components
    ↓
Hooks (useAvatar, useFitPrediction)
    ↓
Context (AvatarContext, UserContext)
    ↓
API Calls (utils/api.ts)
    ↓
Backend FastAPI
```

### Key Technologies

- **React 18** - UI rendering with hooks
- **TypeScript** - Type safety
- **Vite** - Lightning-fast bundler
- **Tailwind CSS** - Utility CSS
- **Three.js** - 3D graphics engine
- **React Router** - Client-side routing
- **Zustand/Context** - State management

---

## 🐍 Backend Architecture

### Directory Structure
```
backend/
├── app.py                   # FastAPI main application
├── config.py                # Configuration settings
├── requirements.txt         # Python dependencies
│
├── database/
│   ├── __init__.py
│   ├── models.py            # SQLAlchemy models
│   │   ├── User
│   │   ├── BodyMeasurement
│   │   ├── Garment
│   │   └── FitPrediction
│   └── garments_db.json     # Sample garment data
│
├── ml/                      # Machine Learning modules
│   ├── __init__.py
│   ├── body_analyzer.py     # MediaPipe body detection
│   │   - Extract pose keypoints
│   │   - Calculate measurements from keypoints
│   │   - Return body analysis results
│   ├── body_classifier.py   # Body type classification
│   │   - RandomForest/KNN classifier
│   │   - Classify body types (slim, average, athletic, etc.)
│   └── skin_tone.py         # Skin tone detection
│       - HSL color extraction
│       - Skin tone classification
│
├── utils/                   # Utility modules
│   ├── __init__.py
│   ├── color_engine.py      # Color matching
│   │   - Color harmony analysis
│   │   - Recommendation engine
│   ├── fit_engine.py        # Core fit prediction
│   │   - Compare measurements
│   │   - Predict fit status
│   │   - Generate recommendations
│   ├── fit_engine_advanced.py
│   │   - Advanced fitting logic
│   │   - Multiple model ensemble
│   ├── style_engine.py      # Style recommendations
│   │   - Pattern recognition
│   │   - Style compatibility
│   └── fit_engine_hybrid.py
│
├── api/                     # API endpoints
│   ├── __init__.py
│   └── routes/              # Route handlers
│       ├── analysis.py      # /api/v1/analyze-body
│       ├── prediction.py    # /api/v1/predict-fit
│       ├── avatar.py        # /api/v1/avatar/*
│       └── garments.py      # /api/v1/garments/*
│
└── uploads/                 # User uploaded files (temporary)
```

### API Routes

```
POST   /api/v1/analyze-body
       - Extract body measurements from image
       - Analyze body type and skin tone
       - Return measurement_id

POST   /api/v1/predict-fit
       - Predict garment fit
       - Return fit status and recommendations

GET    /api/v1/garments
       - Get list of available garments

GET    /api/v1/garments/{id}
       - Get garment details

POST   /api/v1/avatar/generate
       - Generate avatar from measurements

GET    /api/v1/health
       - Health check endpoint
```

### Data Models

```python
# User Model
class User:
    id: int
    email: str
    created_at: datetime
    measurements: List[BodyMeasurement]

# BodyMeasurement Model
class BodyMeasurement:
    id: int
    user_id: int
    height: float
    bust: float
    waist: float
    hips: float
    shoulder_width: float
    inseam: float
    body_type: str
    skin_tone: str
    confidence: float
    created_at: datetime

# Garment Model
class Garment:
    id: int
    name: str
    category: str
    size: str
    measurements: dict
    price: float
    image_url: str

# FitPrediction Model
class FitPrediction:
    id: int
    measurement_id: int
    garment_id: int
    fit_status: str  # good, tight, loose
    confidence: float
    recommendations: List[str]
    created_at: datetime
```

### ML Pipeline

```
┌─────────────────┐
│  User Photo     │
└────────┬────────┘
         ↓
┌──────────────────────────┐
│ MediaPipe Body Analyzer  │ ← Extract pose keypoints
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ Measurement Extraction   │ ← Calculate from keypoints
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ Body Type Classifier     │ ← RandomForest Model
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ Skin Tone Detection      │ ← HSL Analysis
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ Database Storage         │ ← SQLite
└──────────────────────────┘
```

### Key Technologies

- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database
- **MediaPipe** - Pose detection
- **scikit-learn** - Machine learning
- **scikit-image** - Image processing
- **Pillow** - Image manipulation

---

## 🔄 Communication Flow

### Body Analysis Workflow

```
1. Frontend: User uploads photo
        ↓
2. API: POST /api/v1/analyze-body
        ↓
3. Backend: body_analyzer.py
        - MediaPipe pose detection
        - Extract keypoints
        - Calculate measurements
        ↓
4. ML: body_classifier.py
        - Classify body type
        - calc_confidence
        ↓
5. ML: skin_tone.py
        - Extract skin tone
        - HSL format conversion
        ↓
6. Database: Store measurements
        ↓
7. Response: Return to frontend with measurement_id
        ↓
8. Frontend: Display results & update avatar
```

### Fit Prediction Workflow

```
1. Frontend: User selects garment
        ↓
2. API: POST /api/v1/predict-fit
        ├─ measurement_id
        └─ garment_id
        ↓
3. Backend: fit_engine.py
        - Compare measurements
        - Calculate fit score
        ↓
4. ML: Multiple model ensemble
        - RandomForest prediction
        - Rule-based logic
        - Statistical analysis
        ↓
5. Response: Return fit status & recommendations
        ↓
6. Frontend: Display predictions & suggestions
```

---

## 🔐 Security Considerations

### Frontend
- Input validation on forms
- CORS headers properly configured
- No sensitive data in localStorage
- Environment variables for API URL

### Backend
- Request validation with Pydantic
- File upload size limits
- Temporary file cleanup
- SQL injection prevention (SQLAlchemy ORM)
- CORS whitelist configuration

### Data Privacy
- User uploads deleted after processing
- No personal data retention
- Measurements stored securely
- Optional user email for tracking

---

## 🚀 Performance Optimization

### Frontend
- **Code Splitting** - Route-based chunk splitting
- **Lazy Loading** - React.lazy for components
- **Image Optimization** - Compressed assets
- **Caching** - Service worker for offline support
- **Bundle Analysis** - Vite build optimization

### Backend
- **Async Processing** - Async/await for I/O operations
- **Caching** - Redis-ready caching layer
- **Database Indexing** - Optimized queries
- **Model Optimization** - Efficient ML models
- **Request Batching** - Support for bulk operations

---

## 📊 Database Schema

```sql
-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP
);

-- Body Measurements Table
CREATE TABLE body_measurements (
    id INTEGER PRIMARY KEY,
    user_id INTEGER FOREIGN KEY,
    height FLOAT,
    bust FLOAT,
    waist FLOAT,
    hips FLOAT,
    shoulder_width FLOAT,
    inseam FLOAT,
    body_type VARCHAR(50),
    skin_tone VARCHAR(50),
    confidence FLOAT,
    created_at TIMESTAMP
);

-- Garments Table
CREATE TABLE garments (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    size VARCHAR(10),
    measurements JSON,
    price FLOAT,
    image_url TEXT
);

-- Fit Predictions Table
CREATE TABLE fit_predictions (
    id INTEGER PRIMARY KEY,
    measurement_id INTEGER FOREIGN KEY,
    garment_id INTEGER FOREIGN KEY,
    fit_status VARCHAR(50),
    confidence FLOAT,
    recommendations JSON,
    created_at TIMESTAMP
);
```

---

## 🔧 Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=StyleFit Studio
```

### Backend (.env)
```env
DATABASE_URL=sqlite:///./fitverse.db
DEBUG=True
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
MAX_UPLOAD_SIZE=10485760  # 10MB
```

---

## 📈 Scalability

### Potential Improvements

1. **Horizontal Scaling**
   - Containerize backend (Docker)
   - Load balancing with Nginx/HAProxy
   - Database replication

2. **Caching Layer**
   - Redis for session/data caching
   - CDN for static assets

3. **Async Task Queue**
   - Celery for long-running tasks
   - Background job processing

4. **Microservices**
   - Separate ML service
   - Authentication service
   - File processing service

---

## 🧪 Testing Architecture

### Frontend Testing
```
Unit Tests (Jest)
    ├── Components
    ├── Hooks
    ├── Utils
    └── Constants

Integration Tests (Vitest)
    ├── API interactions
    ├── Context updates
    └── Router navigation

E2E Tests (Cypress) - Optional
    ├── User workflows
    ├── Form submissions
    └── 3D interactions
```

### Backend Testing
```
Unit Tests (pytest)
    ├── Utility functions
    ├── ML models
    └── Validators

Integration Tests (pytest)
    ├── API endpoints
    ├── Database operations
    └── ML pipeline

Fixtures & Mocking
    ├── Sample images
    ├── Mock API responses
    └── Database factories
```

---

## 📚 References

- [React Documentation](https://react.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Three.js Documentation](https://threejs.org)
- [MediaPipe Docs](https://developers.google.com/mediapipe)
- [Vite Guide](https://vitejs.dev)

---

**Architecture Last Updated:** April 2026  
**Version:** 1.0.0
