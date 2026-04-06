from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import shutil
import uuid
import os

from pipeline import (
    analyze_body,
    generate_avatar,
    get_products,
    predict_fit,
    recommend_style,
    recommend_colors,
    recommend_size
)

from utils.fit_engine_advanced import AdvancedFitEngine

app = FastAPI(
    title="Virtual Fitting Room Backend",
    description="Unified backend pipeline for Virtual Fitting Room."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class AvatarRequest(BaseModel):
    measurements: dict

from fit_predictor_ml import predict_fit_ml

class UserMeasurementsML(BaseModel):
    chest: float
    waist: float
    hips: float
    height: float
    body_type: str = ""

class GarmentMeasurementsML(BaseModel):
    garment_chest: float
    garment_waist: float
    garment_length: float

class FitPredictionRequest(BaseModel):
    user: UserMeasurementsML
    garment: GarmentMeasurementsML

class WidthFit(BaseModel):
    fit: str
    margin: float

class LengthFit(BaseModel):
    fit: str
    ratio: float

class OverallFit(BaseModel):
    fit: str
    score: int
    confidence: float
    explanation: str

class FitPredictionResponse(BaseModel):
    width: WidthFit
    length: LengthFit
    overall: OverallFit
    size_recommendation: Optional[str] = None

class StyleRecommendationRequest(BaseModel):
    measurements: dict
    body_type: str
    gender: str

class ColorRecommendationRequest(BaseModel):
    skin_tone: str

# --- TASK 1: FIX BACKEND API ---
class UserDimensionsAdvanced(BaseModel):
    chest: float
    waist: float
    hips: float
    height: float

class GarmentDimensionsAdvanced(BaseModel):
    garment_chest: float
    garment_waist: float
    garment_length: float

class FitRequestAdvanced(BaseModel):
    user: UserDimensionsAdvanced
    garment: GarmentDimensionsAdvanced

@app.post("/predict-fit-advanced")
def predict_fit_advanced(request: FitRequestAdvanced):
    """
    Advanced fit prediction evaluating all sizes with production-grade accuracy.
    Uses margin-ratio scoring formula and multi-size comparison.
    """
    user = request.user
    garment = request.garment

    try:
        engine = AdvancedFitEngine()
        result = engine.predict_fit_selected_size(
            user_chest=user.chest,
            user_height=user.height,
            base_garment_chest=garment.garment_chest,
            base_garment_length=garment.garment_length,
            selected_size="M",  # Default selection
        )

        return {
            "width_fit": result["width_fit"],
            "length_fit": result["length_fit"],
            "width_score": round(result["width_score"], 2),
            "length_score": round(result["length_score"], 2),
            "confidence": round(result["confidence"], 2),
            "score": round(result["score"], 0),
            "selected_size": result["selected_size"],
            "recommended_size": result["recommended_size"],
            "recommendation": result["recommendation"],
            "explanation": result["explanation"],
            "all_sizes": result["all_sizes"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
# ------------------------------


@app.post("/analyze-body")
async def api_analyze_body(
    image: UploadFile = File(...)
):
    try:
        file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{image.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        result = analyze_body(image_path=file_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-avatar")
async def api_generate_avatar(request: AvatarRequest):
    try:
        result = generate_avatar(request.measurements)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products")
async def api_get_products():
    try:
        result = get_products()
        return {"garments": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-fit", response_model=FitPredictionResponse)
async def api_predict_fit(request: FitPredictionRequest):
    try:
        user_data = request.user.dict()
        garment_data = request.garment.dict()
        
        if garment_data["garment_chest"] <= 0 or garment_data["garment_length"] <= 0:
            raise ValueError("Garment measurements must be strictly greater than 0.")

        result = predict_fit_ml(user_data, garment_data)
        
        if result["overall"]["fit"] == "Unknown":
            raise HTTPException(status_code=500, detail=result["overall"]["explanation"])
            
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend-style")
async def api_recommend_style(request: StyleRecommendationRequest):
    try:
        result = recommend_style(request.body_type, request.gender)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend-color")
async def api_recommend_color(request: ColorRecommendationRequest):
    try:
        result = recommend_colors(request.skin_tone)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

