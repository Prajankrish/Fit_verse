# FitVerse Backend Configuration

import os
from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).parent

# Database
DATABASE_URL = "sqlite:///./fitverse.db"

# Upload settings
UPLOAD_FOLDER = PROJECT_ROOT / "uploads"
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}

# ML Model settings
BODY_ANALYSIS_CONFIDENCE_THRESHOLD = 0.5
SKIN_TONE_CONFIDENCE_THRESHOLD = 0.5

# API settings
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8081",
    "http://127.0.0.1:3000",
]

# Create directories if they don't exist
UPLOAD_FOLDER.mkdir(exist_ok=True)

# Environment variables
DEBUG = os.getenv("DEBUG", "False") == "True"
