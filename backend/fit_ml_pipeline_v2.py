import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import os

def generate_synthetic_data(num_samples=15000):
    np.random.seed(42)
    
    height = np.random.normal(170, 10, num_samples)
    baseline_chest = height * 0.55 + np.random.normal(0, 5, num_samples)
    
    chest = baseline_chest + np.random.normal(0, 2, num_samples)
    waist = chest * 0.85 + np.random.normal(0, 3, num_samples)
    hips = waist * 1.1 + np.random.normal(0, 3, num_samples)
    
    fit_types = np.random.choice(["slim", "regular", "oversized"], num_samples)
    stretch_factor = np.random.uniform(0.0, 0.3, num_samples)
    
    garment_chest = chest + np.random.normal(2, 4, num_samples)
    garment_waist = waist + np.random.normal(2, 4, num_samples)
    garment_length = height * 0.45 + np.random.normal(0, 3, num_samples)
    
    oversized_mask = fit_types == "oversized"
    slim_mask = fit_types == "slim"
    
    garment_chest[oversized_mask] += np.random.uniform(5, 10, oversized_mask.sum())
    garment_waist[oversized_mask] += np.random.uniform(5, 10, oversized_mask.sum())
    garment_length[oversized_mask] += np.random.uniform(2, 5, oversized_mask.sum())
    
    garment_chest[slim_mask] -= np.random.uniform(2, 5, slim_mask.sum())
    garment_waist[slim_mask] -= np.random.uniform(2, 5, slim_mask.sum())
    garment_length[slim_mask] -= np.random.uniform(1, 3, slim_mask.sum())
    
    chest_margin = garment_chest - chest + (chest * stretch_factor)
    waist_margin = garment_waist - waist + (waist * stretch_factor)
    avg_width_margin = (chest_margin + waist_margin) / 2
    
    height_ratio_labeling = height / garment_length
    
    width_labels = []
    for m in avg_width_margin:
        if m < -6:
            label = np.random.choice(["Tight", "Perfect"], p=[0.8, 0.2])
        elif -6 <= m <= 4:
            label = np.random.choice(["Perfect", "Loose"], p=[0.7, 0.3])
        else:
            label = np.random.choice(["Loose", "Perfect"], p=[0.8, 0.2])
        width_labels.append(label)
        
    length_labels = []
    for hr in height_ratio_labeling:
        if hr > 2.3:
            label = np.random.choice(["Short", "Perfect"], p=[0.8, 0.2])
        elif 2.0 <= hr <= 2.3:
            label = np.random.choice(["Perfect", "Short", "Long"], p=[0.8, 0.1, 0.1])
        else:
            label = np.random.choice(["Long", "Perfect"], p=[0.8, 0.2])
        length_labels.append(label)
        
    overall_labels = []
    for w, l, cm, hr in zip(width_labels, length_labels, chest_margin, height_ratio_labeling):
        if abs(cm) < 3 and abs(hr - 2.0) < 0.2:
            overall_labels.append("Excellent")
        elif w == "Tight" or l == "Short":
            overall_labels.append("Poor")
        else:
            overall_labels.append("Average")
            
    df = pd.DataFrame({
        "chest": chest, "waist": waist, "hips": hips, "height": height,
        "garment_chest": garment_chest, "garment_waist": garment_waist, "garment_length": garment_length,
        "fit_type": fit_types, "stretch_factor": stretch_factor,
        "width_fit": width_labels, "length_fit": length_labels, "overall_fit": overall_labels
    })
    
    return df

def train_pipeline():
    print("Generating dataset...")
    df = generate_synthetic_data(15000)
    
    df["chest_ratio"] = df["chest"] / df["garment_chest"]
    df["waist_ratio"] = df["waist"] / df["garment_waist"]
    df["body_ratio"] = df["chest"] / df["waist"]
    df["height_ratio"] = df["height"] / df["garment_length"]
    df["tightness_score"] = df["chest"] / (df["garment_chest"] * (1 + df["stretch_factor"]))
    
    le_fit = LabelEncoder()
    df["fit_type_encoded"] = le_fit.fit_transform(df["fit_type"])
    
    features = ["chest", "waist", "hips", "height", 
                "garment_chest", "garment_waist", "garment_length", 
                "fit_type_encoded", "stretch_factor",
                "chest_ratio", "waist_ratio", "body_ratio", "height_ratio", "tightness_score"]
                
    X = df[features]
    
    le_width = LabelEncoder()
    le_length = LabelEncoder()
    le_overall = LabelEncoder()
    
    y_width = le_width.fit_transform(df["width_fit"])
    y_length = le_length.fit_transform(df["length_fit"])
    y_overall = le_overall.fit_transform(df["overall_fit"])
    
    X_train, X_test, yw_train, yw_test, yl_train, yl_test, yo_train, yo_test = train_test_split(
        X, y_width, y_length, y_overall, test_size=0.2, random_state=42
    )
    
    print("Training models...")
    rf_width = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1, class_weight="balanced")
    rf_length = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1, class_weight="balanced")
    rf_overall = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1, class_weight="balanced")
    
    rf_width.fit(X_train, yw_train)
    rf_length.fit(X_train, yl_train)
    rf_overall.fit(X_train, yo_train)
    
    print("=== Overall Fit Evaluation ===")
    po_pred = rf_overall.predict(X_test)
    print(confusion_matrix(yo_test, po_pred))
    print(classification_report(yo_test, po_pred, target_names=le_overall.classes_))
    
    print("Saving models...")
    os.makedirs("models", exist_ok=True)
    joblib.dump(rf_width, "models/model_width.pkl")
    joblib.dump(rf_length, "models/model_length.pkl")
    joblib.dump(rf_overall, "models/model_overall.pkl")
    joblib.dump(le_fit, "models/le_fit.pkl")
    joblib.dump(le_width, "models/le_width.pkl")
    joblib.dump(le_length, "models/le_length.pkl")
    joblib.dump(le_overall, "models/le_overall.pkl")
    print("Done!")

def predict_fit_ml(user_data, garment_data):
    try:
        rf_overall = joblib.load("models/model_overall.pkl")
        le_fit = joblib.load("models/le_fit.pkl")
        le_overall = joblib.load("models/le_overall.pkl")
    except FileNotFoundError:
        return {"fit": "Error", "score": 0, "confidence": 0.0, "explanation": "Models not found. Train first."}
        
    c = user_data.get("chest", 90)
    w = user_data.get("waist", 80)
    h = user_data.get("hips", 95)
    ht = user_data.get("height", 170)
    
    gc = garment_data.get("chest", 95)
    gw = garment_data.get("waist", 85)
    gl = garment_data.get("length", 70)
    
    fit_type = garment_data.get("fit_type", "regular")
    stretch = garment_data.get("stretch_factor", 0.0)
    
    c_ratio = c / gc if gc else 1.0
    w_ratio = w / gw if gw else 1.0
    body_ratio = c / w if w else 1.0
    h_ratio = ht / gl if gl else 1.0
    t_score = c / (gc * (1 + stretch)) if gc else 1.0
    
    try:
        fit_encoded = le_fit.transform([fit_type])[0]
    except Exception:
        fit_encoded = le_fit.transform(["regular"])[0]
        
    features = pd.DataFrame([{
        "chest": c, "waist": w, "hips": h, "height": ht,
        "garment_chest": gc, "garment_waist": gw, "garment_length": gl,
        "fit_type_encoded": fit_encoded, "stretch_factor": stretch,
        "chest_ratio": c_ratio, "waist_ratio": w_ratio, "body_ratio": body_ratio, "height_ratio": h_ratio,
        "tightness_score": t_score
    }])
    
    o_pred_idx = rf_overall.predict(features)[0]
    o_probs = rf_overall.predict_proba(features)[0]
    confidence = float(np.max(o_probs))
    
    overall_fit = le_overall.inverse_transform([o_pred_idx])[0]
    
    chest_margin = gc - c + (c * stretch)
    
    if chest_margin < -10:
        overall_fit = "Poor"
        confidence = 1.0
        explanation = "Rule-based safeguard applied: Garment is significantly too tight."
    elif confidence < 0.6:
        if abs(chest_margin) < 3 and abs(h_ratio - 2.0) < 0.2:
            overall_fit = "Excellent"
        else:
            overall_fit = "Average"
        explanation = "Low model confidence, used fallback rule logic."
    else:
        explanation = f"Model predicts {overall_fit} with {confidence*100:.1f}% confidence."
        
    score = 90
    if overall_fit == "Excellent": score = 95
    elif overall_fit == "Average": score = 70
    elif overall_fit == "Poor": score = 40
        
    return {
        "fit": overall_fit,
        "score": score,
        "confidence": round(confidence, 2),
        "explanation": explanation
    }

if __name__ == "__main__":
    train_pipeline()

