import joblib
import os
import pandas as pd
import numpy as np
from typing import Dict, Any

def _load_model(filename: str):
    base_dir = os.path.dirname(__file__)
    alt_paths = [
        os.path.join(base_dir, "models", filename),
        os.path.join(base_dir, filename),
        os.path.join(base_dir, "models", filename.replace("width_model", "model_width").replace("width_encoder", "le_width").replace("length_model", "model_length").replace("length_encoder", "le_length").replace("overall_model", "model_overall").replace("overall_encoder", "le_overall")),
        os.path.join(base_dir, filename.replace("width_model", "model_width").replace("width_encoder", "le_width").replace("length_model", "model_length").replace("length_encoder", "le_length").replace("overall_model", "model_overall").replace("overall_encoder", "le_overall"))
    ]
    for p in alt_paths:
        if os.path.exists(p):
            return joblib.load(p)
    return None

rf_overall = _load_model("overall_model.pkl") or _load_model("model_overall.pkl")
le_overall = _load_model("overall_encoder.pkl") or _load_model("le_overall.pkl")
le_fit = _load_model("le_fit.pkl")

def clamp(val, min_val, max_val):
    return max(min_val, min(max_val, val))

def get_base_features(user_data, garment_chest, garment_waist, garment_length):
    chest = float(user_data.get("chest", 0.0))
    waist = float(user_data.get("waist", 0.0))
    hips = float(user_data.get("hips", 0.0))
    height = float(user_data.get("height", 0.0))

    chest_ratio = chest / garment_chest if garment_chest > 0 else 1.0
    waist_ratio = waist / garment_waist if garment_waist > 0 else 1.0
    body_ratio = chest / waist if waist > 0 else 1.0
    ratio = height / garment_length if garment_length > 0 else 1.0

    try:
        fit_encoded = le_fit.transform(["regular"])[0] if le_fit else 1
    except Exception:
        fit_encoded = 1

    return pd.DataFrame([{
        "chest": chest, "waist": waist, "hips": hips, "height": height,
        "garment_chest": garment_chest, "garment_waist": garment_waist, "garment_length": garment_length,
        "fit_type_encoded": fit_encoded, "stretch_factor": 0.0,
        "chest_ratio": chest_ratio, "waist_ratio": waist_ratio, "body_ratio": body_ratio,
        "height_ratio": ratio, "tightness_score": chest_ratio
    }])

def evaluate_fit(user_data, garment_chest, garment_waist, garment_length):
    chest = float(user_data.get("chest", 0.0))
    height = float(user_data.get("height", 0.0))

    margin = garment_chest - chest
    ratio = height / garment_length if garment_length > 0 else 1.0

    if margin < -6:
        width_fit = "Tight"
    elif margin > 6:
        width_fit = "Loose"
    else:
        width_fit = "Perfect"

    if ratio > 2.2:
        length_fit = "Short"
    elif ratio < 1.8:
        length_fit = "Long"
    else:
        length_fit = "Perfect"

    width_score = clamp((margin + 10) / 20.0, 0.0, 1.0)
    length_score = clamp((ratio - 1.5) / 1.0, 0.0, 1.0)

    confidence = 0.5
    if rf_overall:
        try:
            features = get_base_features(user_data, garment_chest, garment_waist, garment_length)
            o_probs = rf_overall.predict_proba(features)[0]
            sorted_probs = np.sort(o_probs)[::-1]
            confidence = float(sorted_probs[0])
        except Exception:
            pass

    return margin, width_fit, length_fit, width_score, length_score, float(confidence)

def fit_engine_hybrid_predict(user_data: Dict[str, Any], garment_data: Dict[str, Any]) -> Dict[str, Any]:
    selected_size = garment_data.get("size", "M")
    garment_chest = float(garment_data.get("garment_chest", 0.0))
    garment_waist = float(garment_data.get("garment_waist", 0.0))
    garment_length = float(garment_data.get("garment_length", 0.0))

    margin, width_fit, length_fit, width_score, length_score, confidence = evaluate_fit(
        user_data, garment_chest, garment_waist, garment_length
    )

    chest = float(user_data.get("chest", 0.0))
    
    # Task 5: Size Recommendation
    sizes = {"S": 90, "M": 100, "L": 110, "XL": 120}
    
    best_size = "M"
    # Select best size with margin closest to 2–4 cm (we use 3 cm as target)
    best_diff = float("inf")
    for s_name, s_chest in sizes.items():
        s_margin = s_chest - chest
        diff = abs(s_margin - 3.0)
        if diff < best_diff:
            best_diff = diff
            best_size = s_name

    explanation = ""
    if confidence < 0.2:
        explanation += "Low Confidence. "
    
    if margin < -6:
        explanation += "Suggest larger size."
    elif margin > 8:
        explanation += "Suggest smaller size."
    else:
        explanation += "Perfect overall."

    # Task 4 consistency:
    overall_fit = "Perfect"
    if width_fit == "Tight":
        overall_fit = "Poor"

    return {
        "width_fit": width_fit,
        "length_fit": length_fit,
        "width_score": float(width_score),
        "length_score": float(length_score),
        "overall_fit": overall_fit,
        "confidence": float(confidence),
        "recommended_size": best_size,
        "explanation": explanation.strip()
    }
