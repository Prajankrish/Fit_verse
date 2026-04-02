from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database configuration
DATABASE_URL = "sqlite:///./fitverse.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserMeasurement(Base):
    __tablename__ = "user_measurements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Height and body dimensions (cm)
    height = Column(Float)
    bust = Column(Float, nullable=True)
    waist = Column(Float, nullable=True)
    hips = Column(Float, nullable=True)
    inseam = Column(Float, nullable=True)
    shoulder_width = Column(Float, nullable=True)
    
    # Body type and skin tone
    body_type = Column(String)  # slim, average, athletic, muscular, curvy, plus-size, petite, tall
    gender = Column(String, nullable=True)  # male, female, other - detected from photo
    gender_confidence = Column(Float, default=0.5)  # 0-1, confidence in gender detection
    skin_tone_hsl = Column(String)  # HSL format: "25 55% 72%"
    
    # Source
    source_image_path = Column(String, nullable=True)
    analysis_confidence = Column(Float)  # 0-1, how confident the AI is
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Garment(Base):
    __tablename__ = "garments"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    brand = Column(String, index=True)
    category = Column(String, index=True)
    price = Column(Float)
    fabric = Column(String)
    stretch_percentage = Column(Float)  # 0-100
    image_url = Column(String)
    fit_notes = Column(String)
    
    # Size specifications as JSON
    specifications = Column(JSON)
    target_body_types = Column(JSON)  # List of suitable body types
    
    created_at = Column(DateTime, default=datetime.utcnow)

class FitPrediction(Base):
    __tablename__ = "fit_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    measurement_id = Column(Integer, ForeignKey("user_measurements.id"))
    garment_id = Column(String, ForeignKey("garments.id"))
    
    # Fit score and metrics
    overall_fit_score = Column(Float)  # 0-100
    length_fit = Column(Float)  # -1 (too short), 0 (perfect), 1 (too long)
    width_fit = Column(Float)   # -1 (too tight), 0 (perfect), 1 (too loose)
    proportional_fit = Column(Float)  # How well proportions match
    
    # Issues and recommendations
    fit_issues = Column(JSON)  # List of identified issues
    recommendations = Column(JSON)  # Suggested alternatives
    
    created_at = Column(DateTime, default=datetime.utcnow)

class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    garment_id = Column(String, index=True)
    garment_name = Column(String)
    garment_image = Column(String, nullable=True)
    size = Column(String)
    
    # Save combinations and recommendations explicitly requested
    fit_score = Column(Float, nullable=True)
    style_combination = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
