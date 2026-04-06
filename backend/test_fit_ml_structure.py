import pytest
from app import FitPredictionResponse
from fit_predictor_ml import predict_fit_ml

def test_ml_structure():
    user = {"chest": 95, "waist": 80, "hips": 100, "height": 170, "body_type": "average"}
    garment = {"garment_chest": 102, "garment_waist": 90, "garment_length": 70}
    
    res = predict_fit_ml(user, garment)
    
    assert "width" in res
    assert "length" in res
    assert "overall" in res
    
    assert "margin" in res["width"]
    assert "ratio" in res["length"]
    assert "confidence" in res["overall"]
    
    parsed = FitPredictionResponse(**res)
    assert parsed.width.margin == 102 - 95
