# StyleFit Studio - AI-Powered Virtual Fitting Room

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://react.dev)
[![Python Backend](https://img.shields.io/badge/Backend-Python%20FastAPI-green)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite-646CFF?logo=vite)](https://vitejs.dev)

## 🎯 Overview

**StyleFit Studio** is a cutting-edge virtual fitting room application that combines AI and 3D graphics to revolutionize online shopping. Users can create personalized avatars, try on clothing items, and receive intelligent fit predictions based on their body measurements and style preferences.

### Key Features

- **🧬 AI Body Analysis** - Automatic body measurement extraction from photos using MediaPipe
- **👤 Avatar Generation** - Create customizable 3D avatars with diverse body types and skin tones
- **👕 Virtual Try-On** - Browse and try on clothing items in real-time
- **📏 Size Intelligence** - AI-powered fit prediction and size recommendations
- **⚡ Real-time Rendering** - Smooth 3D graphics powered by Three.js
- **📱 Responsive Design** - Works seamlessly across all devices

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.x or higher ([install](https://nodejs.org))
- **Python** 3.9+ ([install](https://www.python.org))
- **npm** or **yarn** package manager

### Frontend Installation

```bash
# Clone repository
git clone https://github.com/yourusername/style-fit-studio.git
cd style-fit-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

Server runs at: `http://localhost:5173`

### Backend Installation

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python app.py
```

Server runs at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

---

## 📦 Available Scripts

### Frontend

```bash
npm run dev           # Start development server with hot reload
npm run build         # Build for production (optimized)
npm run preview       # Preview production build locally
npm run lint          # Run ESLint for code quality
npm test              # Run unit tests
npm test:watch       # Run tests in watch mode
```

### Backend

```bash
python app.py         # Start FastAPI server
python -m pytest      # Run tests
```

---

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/           # Reusable React components
│   ├── AIAvatarGenerator.tsx
│   ├── AIStylistContextBar.tsx
│   ├── AppNavbar.tsx
│   ├── AvatarViewer.tsx
│   ├── BodyAnalysisResults.tsx
│   ├── ClothingCard.tsx
│   ├── FitAnalysisPanel.tsx
│   ├── FitPredictionSystem.tsx
│   └── ...more components
├── pages/                # Page-level components
├── hooks/               # Custom React hooks
├── contexts/            # React Context for state management
├── utils/               # Utility functions and helpers
├── lib/                 # Library functions
├── assets/              # Images, icons, fonts
└── App.tsx              # Main application component
```

### Backend Structure
```
backend/
├── app.py               # FastAPI main application
├── config.py            # Configuration settings
├── requirements.txt     # Python dependencies
│
├── database/
│   ├── models.py        # SQLAlchemy ORM models
│   └── garments_db.json # Garment database
│
├── ml/
│   ├── body_analyzer.py     # MediaPipe body analysis
│   ├── body_classifier.py   # ML body type classification
│   ├── skin_tone.py         # Skin tone detection
│
├── utils/
│   ├── color_engine.py      # Color matching & recommendations
│   ├── fit_engine.py        # Core fit prediction logic
│   ├── style_engine.py      # Style recommendations
│   └── fit_engine_advanced.py
│
├── api/
│   └── routes/          # API endpoint definitions
│
└── uploads/             # Temporary uploaded files
```

---

## 🔌 API Documentation

### Core Endpoints

#### 1. Body Analysis from Photo
```http
POST /api/v1/analyze-body
```
Extract measurements, body type, and skin tone from user photo.

**Request:**
```json
{
  "file": "<image_file>",
  "email": "user@example.com"
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
    "skin_tone_hsl": "25 55% 72%"
  },
  "measurements": {
    "height": 165.5,
    "bust": 88.3,
    "waist": 70.2,
    "hips": 92.1
  }
}
```

#### 2. Fit Prediction
```http
POST /api/v1/predict-fit
```
Predict how a garment will fit based on measurements.

**Request:**
```json
{
  "measurement_id": 1,
  "garment_id": "shirt-001"
}
```

**Response:**
```json
{
  "success": true,
  "fit_prediction": {
    "fit_status": "good",
    "confidence": 0.85,
    "recommendations": ["Consider size M", "Length is appropriate"]
  }
}
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18.x** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Three.js & React Three Fiber** - 3D graphics
- **React Router** - Client-side routing
- **Zustand** - State management

### Backend
- **Python 3.9+** - Programming language
- **FastAPI** - High-performance web framework
- **SQLAlchemy** - ORM for database
- **SQLite** - Lightweight database
- **MediaPipe** - AI pose detection
- **scikit-learn** - ML model training
- **scikit-image** - Image processing

---

## 📚 Documentation

For more detailed information, see:

- [Backend Setup & API Reference](./backend/README.md) - Backend configuration and endpoints
- [Architecture Guide](./docs/ARCHITECTURE.md) - System design and components
- [Contributing Guidelines](./CONTRIBUTING.md) - How to contribute

---

## 🔐 Security

- All user uploads are temporary and deleted after processing
- Environment variables are required for sensitive configurations
- API endpoints validate all input data
- CORS is properly configured for development/production

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Code style and conventions
- Development workflow
- Testing requirements
- Pull request process

---

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

## 🎨 Project Status

Currently in **active development**. Features and APIs may change.

---

**Built with ❤️ using React, Python, and Three.js**
