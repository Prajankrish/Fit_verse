from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import json
import os
import shutil
from typing import Dict, List, Optional
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import ML modules
from ml.body_analyzer import BodyAnalyzer, HeightEstimator
from ml.body_classifier import BodyTypeClassifier
from ml.skin_tone import SkinToneAnalyzer
from utils.fit_engine import FitEngine
from utils.color_engine import ColorEngine
from utils.style_engine import StyleEngine

# Database
from database.models import get_db, User, UserMeasurement, Garment, FitPrediction
from sqlalchemy.orm import Session

# Initialize FastAPI app
app = FastAPI(
    title="FitVerse API",
    description="Virtual Fitting Room - AI Body Analysis & Garment Fit Prediction",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global ML models
body_analyzer = BodyAnalyzer()
body_classifier = BodyTypeClassifier()
skin_tone_analyzer = SkinToneAnalyzer()
fit_engine = FitEngine()

# Setup directories
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Database directory
DB_DIR = Path(__file__).parent / "database"
GARMENTS_DB_PATH = DB_DIR / "garments_db.json"

# Pydantic models
class WishlistRequest(BaseModel):
    user_id: Optional[int] = None
    garment_id: str
    garment_name: str
    garment_image: Optional[str] = None
    size: str
    fit_score: Optional[float] = None
    style_combination: Optional[dict] = None
    recommendations: Optional[dict] = None

class AnalysisRequest(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None

class FitPredictionRequest(BaseModel):
    measurement_id: Optional[int] = None
    garment_id: str
    selected_size: str
    measurements: Optional[dict] = None

class MeasurementData(BaseModel):
    height: float
    bust: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    inseam: Optional[float] = None
    body_type: str
    skin_tone_hsl: str

class ColorRecommendationRequest(BaseModel):
    skin_tone_hsl: str
    limit: Optional[int] = 5

class StyleRecommendationRequest(BaseModel):
    body_type: str
    occasion: Optional[str] = None

class GarmentRecommendationRequest(BaseModel):
    measurement_id: Optional[int] = None
    skin_tone_hsl: str
    body_type: str
    limit: Optional[int] = 6

# API Routes

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "FitVerse API"}

@app.post("/api/v1/upload-mobile-image")
async def upload_mobile_image(
    sessionId: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        file_path = UPLOAD_DIR / f"mobile_{sessionId}.jpg"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"status": "success"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/api/v1/check-mobile-image")
async def check_mobile_image(sessionId: str):
    file_path = UPLOAD_DIR / f"mobile_{sessionId}.jpg"
    if file_path.exists():
        return {"status": "ready"}
    return JSONResponse(status_code=404, content={"status": "pending"})

@app.get("/api/v1/get-mobile-image")
async def get_mobile_image(sessionId: str):
    file_path = UPLOAD_DIR / f"mobile_{sessionId}.jpg"
    if file_path.exists():
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"error": "Not found"})

@app.post("/api/v1/analyze-body")
async def analyze_body(
    file: UploadFile = File(...),
    email: str = None,
    db: Session = Depends(get_db)
):
    """
    Analyze user's body from uploaded photo.
    Returns body type, measurements, skin tone.
    
    Process:
    1. Save uploaded image
    2. Detect pose with MediaPipe
    3. Classify body type
    4. Analyze skin tone
    5. Store in database
    6. Return measurement data for avatar creation
    """
    
    try:
        # Validate file
        if not file.filename:
            raise ValueError("No file provided")
        
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in allowed_extensions:
            raise ValueError(f"Unsupported image format: {file_ext}. Allowed: {', '.join(allowed_extensions)}")
        
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        print(f"Analyzing image: {file.filename}")
        
        # 1. Analyze body proportions
        measurements = body_analyzer.analyze_image(str(file_path))
        if not measurements or measurements.get('confidence', 0) < 0.3:
            raise ValueError("Could not detect body in image. Ensure the full body is visible and well-lit.")
        print(f"Extracted measurements: {measurements}")
        
        # 2. Estimate height (cm)
        estimated_height = HeightEstimator.estimate_height_from_proportions(measurements)
        if estimated_height < 140 or estimated_height > 220:
            raise ValueError(f"Invalid height estimate: {estimated_height:.0f}cm. Please upload a clearer full-body photo.")
        print(f"Estimated height: {estimated_height:.1f} cm")
        
        # 3. Classify body type
        body_type, body_confidence = body_classifier.classify(measurements, estimated_height)
        if body_confidence < 0.25:
            print(f"Warning: Low body type classification confidence: {body_confidence:.2f}")
        print(f"Body type: {body_type} (confidence: {body_confidence:.2f})")
        
        # 3b. Detect gender from body proportions
        detected_gender, gender_confidence = body_classifier.detect_gender(measurements)
        if gender_confidence < 0.7:
            detected_gender = 'unisex'
        print(f"Detected gender: {detected_gender} (confidence: {gender_confidence:.2f})")
        
        # 4. Generate estimated measurements
        estimated_measurements = body_classifier.estimate_measurements(
            measurements, estimated_height, body_type
        )
        print(f"Base estimated measurements: {estimated_measurements}")
        
        # Override with exact MediaPipe calculations from body_measurement if possible
        confidence_score = body_confidence
        try:
            from body_measurement import extract_measurements_from_image
            with open(file_path, "rb") as f:
                mp_measurements = extract_measurements_from_image(f.read(), estimated_height)
            estimated_measurements['bust'] = mp_measurements['chest']
            estimated_measurements['waist'] = mp_measurements['waist']
            estimated_measurements['hips'] = mp_measurements['hips']
            estimated_measurements['shoulder_width'] = mp_measurements['shoulder_width']
            
            if 'confidence' in mp_measurements:
                confidence_score = max(0.5, mp_measurements['confidence'])
            
            # Post-process body type based on realistic 3D circumferences
            bust_to_height = estimated_measurements['bust'] / estimated_height
            hip_to_height = estimated_measurements['hips'] / estimated_height
            
            if hip_to_height > 0.68 or bust_to_height > 0.68:
                body_type = "plussize"
            elif hip_to_height > 0.62 or bust_to_height > 0.62:
                body_type = "curvy"
            elif hip_to_height < 0.54 and bust_to_height < 0.54:
                body_type = 'slim'
            else:
                body_type = 'average'

            print(f"Refined measurements with MediaPipe: {estimated_measurements}")
            print(f"Refined final body type: {body_type}")
        except Exception as e:
            print(f"Could not use body_measurement refinement: {e}")
        
        # 5. Analyze skin tone
        skin_tone_hsl, skin_confidence = skin_tone_analyzer.analyze_image(str(file_path))
        if skin_confidence < 0.2:
            print(f"Warning: Low skin tone detection confidence: {skin_confidence:.2f}")
        print(f"Skin tone: {skin_tone_hsl} (confidence: {skin_confidence:.2f})")
        
        # 6. Store in database
        # Create or get user
        user = db.query(User).filter(User.email == email).first() if email else None
        if email and not user:
            user = User(email=email, username=email.split('@')[0])
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create measurement record
        user_measurement = UserMeasurement(
            user_id=user.id if user else None,
            height=estimated_measurements['height'],
            bust=estimated_measurements['bust'],
            waist=estimated_measurements['waist'],
            hips=estimated_measurements['hips'],
            shoulder_width=estimated_measurements['shoulder_width'],
            inseam=estimated_measurements['inseam'],
            body_type=body_type,
            gender=detected_gender,
            gender_confidence=gender_confidence,
            skin_tone_hsl=skin_tone_hsl,
            source_image_path=str(file_path),
            analysis_confidence=min(measurements['confidence'], confidence_score, skin_confidence)
        )
        db.add(user_measurement)
        db.commit()
        db.refresh(user_measurement)
        
        return {
            'success': True,
            'message': 'Measurement analysis successful.',
            'confidence': confidence_score,
            'measurement_id': user_measurement.id,
            'body_analysis': {
                'body_type': body_type,
                'gender': detected_gender,
                'confidence': round(body_confidence * 100),
                'gender_confidence': round(gender_confidence * 100),
                'skin_tone_hsl': skin_tone_hsl,
                'analysis_confidence': round(user_measurement.analysis_confidence * 100)
            },
            'measurements': estimated_measurements,
            'notes': 'Measurements estimated from pose analysis. Review them carefully - you can adjust values for better fit predictions.',
            'quality_indicators': {
                'body_type_confidence': round(body_confidence * 100),
                'gender_confidence': round(gender_confidence * 100),
                'skin_tone_confidence': round(skin_confidence * 100),
                'overall_quality': round(measurements.get('confidence', 0) * 100)
            }
        }
    
    except ValueError as ve:
        print(f"Validation error in body analysis: {str(ve)}")
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(ve)}")
    except Exception as e:
        print(f"Error analyzing body: {str(e)}")
        error_detail = "Failed to analyze image. Possible reasons: unclear image, face not visible, or body not fully visible in frame."
        raise HTTPException(status_code=500, detail=error_detail)

@app.post("/api/v1/predict-fit")
async def predict_fit(
    request: FitPredictionRequest,
    db: Session = Depends(get_db)
):
    """
    Predict garment fit for user measurements.
    Returns fit score, issues, and recommendations.
    """
    
    try:
        # Get user measurements
# Get user measurements
        measurement = None
        if request.measurements:
            meas = request.measurements
            measurement_dict = {
                'height': meas.get('height', 170.0),
                'bust': meas.get('bust', 90.0),
                'waist': meas.get('waist', 70.0),
                'hips': meas.get('hips', 95.0),
                'inseam': meas.get('inseam', 75.0),
                'shoulder_width': meas.get('shoulder_width', 40.0),
                'body_type': meas.get('body_type', 'average'),
                'gender': meas.get('gender', 'other'),
                'length': meas.get('height', 170.0) / 2.5
            }
            analysis_confidence = 0.5
            skin_tone_hsl = meas.get('skin_tone_hsl')
        else:
            measurement = db.query(UserMeasurement).filter(
                UserMeasurement.id == request.measurement_id
            ).first()

            if not measurement:
                raise HTTPException(
                    status_code=404,
                    detail=f"Measurement ID {request.measurement_id} not found. Please perform body analysis first."
                )
            
            measurement_dict = {
                'height': measurement.height,
                'bust': measurement.bust,
                'waist': measurement.waist,
                'hips': measurement.hips,
                'inseam': measurement.inseam,
                'shoulder_width': measurement.shoulder_width,
                'body_type': measurement.body_type,
                'gender': measurement.gender or 'other',
                'length': measurement.height / 2.5 if measurement.height else None  # Proxy for torso length
            }
            analysis_confidence = measurement.analysis_confidence
            skin_tone_hsl = measurement.skin_tone_hsl

        # Load garment using helper
        garment = get_garment_from_db(request.garment_id)

        if not garment:
            raise HTTPException(
                status_code=404,
                detail=f"Garment ID '{request.garment_id}' not found in database"
            )

        # Validate size availability
        if request.selected_size not in garment['specifications']['sizes']:     
            available_sizes = ', '.join(garment['specifications']['sizes'].keys())
            raise HTTPException(
                status_code=400,
                detail=f"Size '{request.selected_size}' not available. Available sizes: {available_sizes}"
            )
        
        # Predict fit
        fit_prediction = fit_engine.predict_fit(
            measurement_dict,
            garment,
            request.selected_size
        )
        print(f"FIT_ENGINE DEBUG: input size={request.selected_size}, result score={fit_prediction.get('overall_fit_score')}, breakdown={fit_prediction.get('fit_breakdown')}")
        
        if 'error' in fit_prediction:
            raise HTTPException(status_code=400, detail=fit_prediction['error'])
        
        # Generate intelligent explanations and metrics (Phase 1 enhancement)
        explanation = fit_engine.generate_fit_explanation(fit_prediction)
        comfort_metrics = fit_engine.calculate_comfort_metrics(
            measurement_dict,
            garment['specifications']['sizes'][request.selected_size],
            garment.get('category', 'tops')
        )
        avatar_posture = fit_engine.suggest_avatar_posture(fit_prediction['overall_fit_score'])
        
        # Add new fields to fit prediction
        fit_prediction['explanation'] = explanation
        fit_prediction['comfort_metrics'] = comfort_metrics
        fit_prediction['avatar_posture'] = avatar_posture
        
        if measurement:
            db_prediction = FitPrediction(
                measurement_id=request.measurement_id,
                garment_id=request.garment_id,
                overall_fit_score=fit_prediction['overall_fit_score'],
                length_fit=fit_prediction['fit_breakdown']['length'] / 100,
                width_fit=fit_prediction['fit_breakdown']['width'] / 100,
                proportional_fit=fit_prediction['fit_breakdown']['proportional'] / 100,
                fit_issues=fit_prediction['issues'],
                recommendations=fit_prediction['recommendations']['suggestions']
            )
            db.add(db_prediction)
            db.commit()

        # Get skin tone data for color harmony
        # skin_tone_hsl already extracted
        color_harmony_data = {}

        if skin_tone_hsl:
            try:
                color_recommendation = ColorEngine.get_color_recommendations(skin_tone_hsl)
                best_colors = [c.get('name', '') for c in color_recommendation.get('recommended_palette', {}).get('colors', [])]
                color_harmony_data = {
                    'undertone': color_recommendation.get('undertone'),
                    'recommended_colors': best_colors
                }
            except:
                # If color analysis fails, continue without it
                pass

        return {
            'success': True,
            'fit_prediction': fit_prediction,
            'measurement_id': request.measurement_id if measurement else None,
            'garment_id': request.garment_id,
            'skin_tone_hsl': skin_tone_hsl,
            'color_harmony': color_harmony_data,
            'confidence': analysis_confidence if analysis_confidence else 0
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error predicting fit: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to predict fit. Please check your measurements and try again."
        )

@app.post("/api/v1/recommend-sizes")
async def recommend_sizes(request: FitPredictionRequest, db: Session = Depends(get_db)):
    """
    Evaluate all available sizes for a garment and recommend the best fitting ones.
    Helps users find optimal sizes if their first choice isn't ideal.
    """
    
    try:
        # Get user measurements
        measurement = None
        if request.measurements:
            meas = request.measurements
            measurement_dict = {
                'height': meas.get('height', 170.0),
                'bust': meas.get('bust', 90.0),
                'waist': meas.get('waist', 70.0),
                'hips': meas.get('hips', 95.0),
                'inseam': meas.get('inseam', 75.0),
                'shoulder_width': meas.get('shoulder_width', 40.0),
                'body_type': meas.get('body_type', 'average'),
                'gender': meas.get('gender', 'other'),
                'length': meas.get('height', 170.0) / 2.5
            }
            analysis_confidence = 0.5
            skin_tone_hsl = meas.get('skin_tone_hsl')
        else:
            measurement = db.query(UserMeasurement).filter(
                UserMeasurement.id == request.measurement_id
            ).first()

            if not measurement:
                raise HTTPException(
                    status_code=404,
                    detail=f"Measurement ID {request.measurement_id} not found"
                )

            measurement_dict = {
                'height': measurement.height,
                'bust': measurement.bust,
                'waist': measurement.waist,
                'hips': measurement.hips,
                'inseam': measurement.inseam,
                'shoulder_width': measurement.shoulder_width,
                'body_type': measurement.body_type,
                'gender': measurement.gender or 'other',
                'length': measurement.height / 2.5 if measurement.height else None
            }
            analysis_confidence = measurement.analysis_confidence
            skin_tone_hsl = measurement.skin_tone_hsl

        # Load garment using helper
        garment = get_garment_from_db(request.garment_id)

        if not garment:
            raise HTTPException(
                status_code=404,
                detail=f"Garment ID '{request.garment_id}' not found"
            )

        # Get size recommendations
        size_recommendations = fit_engine.recommend_sizes(measurement_dict, garment)

        # Get skin tone data for color harmony
        
        if skin_tone_hsl:
            try:
                color_recommendation = ColorEngine.get_color_recommendations(skin_tone_hsl)
                best_colors = [c.get('name', '') for c in color_recommendation.get('recommended_palette', {}).get('colors', [])]
                color_harmony_data = {
                    'undertone': color_recommendation.get('undertone'),
                    'recommended_colors': best_colors
                }
            except:
                # If color analysis fails, continue without it
                pass
        
        return {
            'success': True,
            'garment_id': request.garment_id,
            'garment_name': garment['name'],
            'current_size': request.selected_size,
            'size_recommendations': size_recommendations['ranked_sizes'][:5],  # Top 5 recommendations
            'best_fit_size': size_recommendations['best_fit'],
            'all_sizes': size_recommendations['all_sizes'],
            'skin_tone_hsl': skin_tone_hsl,
            'color_harmony': color_harmony_data,
            'measurement_id': request.measurement_id if measurement else None,
            'confidence': analysis_confidence if analysis_confidence else 0
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error recommending sizes: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to recommend sizes"
        )

import sqlite3

SQLITE_DB_PATH = DB_DIR / "garments.db"

def get_garment_from_db(garment_id: str):
    if SQLITE_DB_PATH.exists():
        conn = sqlite3.connect(str(SQLITE_DB_PATH))
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM garments WHERE id=?", (garment_id,))
        row = c.fetchone()
        conn.close()
        if row:
            # Determine target gender from name
            name_lower = row["name"].lower()
            target_gender = 'unisex'
            if 'women' in name_lower or 'girls' in name_lower:
                target_gender = 'female'
            elif 'men' in name_lower or 'boys' in name_lower:
                target_gender = 'male'

            return {
                "id": str(row["id"]),
                "name": row["name"],
                "brand": row["brand"],
                "category": row["category"],
                "price": row["price"],
                "image": row["image"],
                "fabric": row["fabric"],
                "stretch_percentage": row["stretch_percentage"],
                "target_gender": target_gender,
                "specifications": json.loads(row["sizes_json"])
            }

    # Fallback
    if GARMENTS_DB_PATH.exists():
        with open(GARMENTS_DB_PATH, 'r') as f:
            db = json.load(f)
            for g in db.get('garments', []):
                if g['id'] == garment_id:
                    name_lower = g.get("name", "").lower()
                    target_gender = 'unisex'
                    if 'women' in name_lower or 'girls' in name_lower:
                        target_gender = 'female'
                    elif 'men' in name_lower or 'boys' in name_lower:
                        target_gender = 'male'
                    g['target_gender'] = target_gender
                    return g
    return None

@app.get("/api/v1/garments")
async def list_garments(
    limit: int = 50, 
    offset: int = 0, 
    search: Optional[str] = None, 
    category: Optional[str] = None,
    gender: Optional[str] = None
):
    """Get all available garments with pagination and search."""
    try:
        if SQLITE_DB_PATH.exists():
            conn = sqlite3.connect(str(SQLITE_DB_PATH))
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            
            query = "SELECT * FROM garments WHERE 1=1"
            count_query = "SELECT COUNT(*) FROM garments WHERE 1=1"
            params = []
            
            if search:
                query += " AND (name LIKE ? OR brand LIKE ?)"
                count_query += " AND (name LIKE ? OR brand LIKE ?)"
                params.extend([f"%{search}%", f"%{search}%"])
                
            if category and category != 'all':
                query += " AND category = ?"
                count_query += " AND category = ?"
                params.append(category)
                
            if gender and gender != 'all':
                # Attempt to filter by gender using the name and brand columns
                if gender == 'men':
                    gender_clause = " AND name LIKE '%men%' AND name NOT LIKE '%women%'"
                elif gender == 'women':
                    gender_clause = " AND name LIKE '%women%'"
                elif gender == 'kids':
                    gender_clause = " AND (name LIKE '%boy%' OR name LIKE '%girl%' OR name LIKE '%kid%')"
                else:
                    gender_clause = ""
                
                query += gender_clause
                count_query += gender_clause
                
            c.execute(count_query, params)
            total = c.fetchone()[0]
            
            query += " LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            c.execute(query, params)
            rows = c.fetchall()
            conn.close()
            
            garments = []
            for row in rows:
                garments.append({
                    "id": row["id"],
                    "name": row["name"],
                    "brand": row["brand"],
                    "category": row["category"],
                    "price": row["price"],
                    "image": row["image"],
                    "fabric": row["fabric"],
                    "stretch_percentage": row["stretch_percentage"],
                    "specifications": json.loads(row["sizes_json"])
                })
            
            return {
                'success': True,
                'garments': garments,
                'total': total,
                'limit': limit,
                'offset': offset
            }

        # Fallback to JSON
        if not GARMENTS_DB_PATH.exists():
            raise FileNotFoundError(f"Garments database not found at {GARMENTS_DB_PATH}")
        with open(GARMENTS_DB_PATH, 'r') as f:
            garments_db = json.load(f)
            
        all_garments = garments_db['garments']
        
        if category and category != 'all':
            all_garments = [g for g in all_garments if g.get('category') == category]
            
        if search:
            s = search.lower()
            all_garments = [g for g in all_garments if s in g.get('name', '').lower() or s in g.get('brand', '').lower()]
            
        total = len(all_garments)
        paginated = all_garments[offset:offset+limit]
        
        return {
            'success': True,
            'garments': paginated,
            'total': total,
            'limit': limit,
            'offset': offset
        }
    except Exception as e:
        print(f"Error loading garments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/garments/{garment_id}")
async def get_garment(garment_id: str):
    """Get specific garment details."""
    try:
        garment = get_garment_from_db(garment_id)
        if garment:
            return {
                'success': True,
                'garment': garment
            }
        raise HTTPException(status_code=404, detail="Garment not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error loading garment {garment_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/measurement/{measurement_id}")
async def get_measurement(measurement_id: int, db: Session = Depends(get_db)):
    """Get user measurements by ID."""
    measurement = db.query(UserMeasurement).filter(
        UserMeasurement.id == measurement_id
    ).first()
    
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")
    
    return {
        'success': True,
        'measurement': {
            'id': measurement.id,
            'height': measurement.height,
            'bust': measurement.bust,
            'waist': measurement.waist,
            'hips': measurement.hips,
            'inseam': measurement.inseam,
            'shoulder_width': measurement.shoulder_width,
            'body_type': measurement.body_type,
            'skin_tone_hsl': measurement.skin_tone_hsl,
            'analysis_confidence': measurement.analysis_confidence
        }
    }

@app.post("/api/v1/color-recommendations")
async def get_color_recommendations(request: ColorRecommendationRequest):
    """
    Get color recommendations based on skin tone.
    
    Uses color theory to suggest:
    - Complementary colors
    - Analogous colors
    - Triadic colors
    - Seasonal color palettes
    """
    try:
        recommendations = ColorEngine.get_color_recommendations(request.skin_tone_hsl)
        suggested_colors = ColorEngine.suggest_garment_colors(request.skin_tone_hsl, request.limit)
        
        return {
            'success': True,
            'skin_tone_hsl': request.skin_tone_hsl,
            'undertone': recommendations['undertone'],
            'recommended_palette': recommendations['recommended_palette'],
            'complementary_palette': recommendations['complementary_palette'],
            'color_harmonies': recommendations['color_harmonies'],
            'seasonal_recommendations': recommendations['seasonal_recommendations'],
            'suggested_colors': suggested_colors
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/style-recommendations")
async def get_style_recommendations(request: StyleRecommendationRequest):
    """
    Get style recommendations based on body type and optional occasion.
    
    Suggests:
    - Fashion styles suitable for body type
    - Flattering fits and pieces
    - Occasion-specific recommendations
    """
    try:
        profile = StyleEngine.get_detailed_style_profile(request.body_type, request.occasion)
        
        return {
            'success': True,
            'body_type': request.body_type,
            'occasion': request.occasion,
            'profile': profile
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/garment-recommendations")
async def get_garment_recommendations(request: GarmentRecommendationRequest):
    """
    Get recommended garments based on fit, color, and style.
    """
    try:
        # Load garments
        garments = []

        if SQLITE_DB_PATH.exists():
            import sqlite3
            conn = sqlite3.connect(str(SQLITE_DB_PATH))
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM garments ORDER BY RANDOM() LIMIT 200")
            rows = c.fetchall()
            conn.close()
            import json
            for row in rows:
                garments.append({
                    "id": row["id"],
                    "name": row["name"],
                    "brand": row["brand"],
                    "category": row["category"],
                    "price": row["price"],
                    "image": row["image"],
                    "fabric": row["fabric"],
                    "stretch_percentage": row["stretch_percentage"],
                    "specifications": json.loads(row["sizes_json"]) if row["sizes_json"] else {}
                })
        else:
            if not GARMENTS_DB_PATH.exists():
                raise FileNotFoundError(f"Garments database not found at {GARMENTS_DB_PATH}")
            with open(GARMENTS_DB_PATH, 'r') as f:
                import json
                garments_db = json.load(f)
            garments = garments_db['garments']

        style_recs = StyleEngine.get_style_recommendations_for_body_type(request.body_type)
        recommended_styles = [s['id'] for s in style_recs['recommended_styles']]

        # Score each garment
        scored_garments = []
        for garment in garments:
            if 'primary_color_hsl' in garment:
                color_score = ColorEngine.get_color_match_score(
                    garment['primary_color_hsl'],
                    request.skin_tone_hsl,
                    'analogous'
                )
            else:
                color_score = 50

            style_tags = garment.get('style_tags', [])
            style_score = StyleEngine.get_style_match_score(
                style_tags,
                recommended_styles,
                request.body_type
            )

            target_types = garment.get('target_body_types', [])
            body_type_score = 100 if request.body_type in target_types else 60

            combined_score = (body_type_score * 0.5) + (color_score * 0.25) + (style_score * 0.25)

            scored_garments.append({
                **garment,
                'recommendation_score': combined_score,
                'color_match_score': color_score,
                'style_match_score': style_score,
                'body_type_compatibility': body_type_score
            })

        recommended = sorted(scored_garments, key=lambda x: x['recommendation_score'], reverse=True)

        return {
            'success': True,
            'recommendations': recommended[:request.limit],
            'total_available': len(garments),
            'criteria': {
                'body_type': request.body_type,
                'skin_tone_hsl': request.skin_tone_hsl,
                'preferred_styles': recommended_styles
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/wishlist")
async def add_to_wishlist(request: WishlistRequest, db: Session = Depends(get_db)):
    """Add a garment trial and its recommendations to the wishlist."""
    from database.models import WishlistItem
    try:
        item = WishlistItem(
            user_id=request.user_id,
            garment_id=request.garment_id,
            garment_name=request.garment_name,
            garment_image=request.garment_image,
            size=request.size,
            fit_score=request.fit_score,
            style_combination=request.style_combination,
            recommendations=request.recommendations
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return {"success": True, "item_id": item.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/wishlist")
async def get_wishlist(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all wishlist items."""
    from database.models import WishlistItem
    try:
        query = db.query(WishlistItem)
        if user_id:
            query = query.filter(WishlistItem.user_id == user_id)
        
        items = query.order_by(WishlistItem.created_at.desc()).all()
        return {
            "success": True,
            "items": [{
                "id": i.id,
                "garment_id": i.garment_id,
                "garment_name": i.garment_name,
                "garment_image": i.garment_image,
                "size": i.size,
                "fit_score": i.fit_score,
                "style_combination": i.style_combination,
                "recommendations": i.recommendations,
                "created_at": i.created_at
            } for i in items]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from typing import Dict, Any
from pydantic import BaseModel
from fit_engine_rule_based import predict_fit as rule_based_predict_fit

class SimplePredictFitRequest(BaseModel):
    user_measurements: Dict[str, float]
    product_measurements: Dict[str, float]

@app.post("/predict-fit")
async def simple_predict_fit(request: SimplePredictFitRequest) -> Dict[str, Any]:
    """
    Rule-based fit prediction assessing tight/loose constraints 
    from chest and waist differences.
    """
    return rule_based_predict_fit(request.user_measurements, request.product_measurements)

@app.get("/")
async def root():
    """API documentation."""
    return {
        'name': 'FitVerse API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health',
            'analyze_body': 'POST /api/v1/analyze-body',
            'predict_fit': 'POST /api/v1/predict-fit',
            'list_garments': 'GET /api/v1/garments',
            'get_garment': 'GET /api/v1/garments/{garment_id}',
            'get_measurement': 'GET /api/v1/measurement/{measurement_id}'
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

