import cv2
import mediapipe as mp
import numpy as np
import math
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict


# Calibration and quality constants
MASK_THRESHOLD = 0.8
BUST_CIRCUMFERENCE_FACTOR = 2.6
WAIST_CIRCUMFERENCE_FACTOR = 2.5
HIPS_CIRCUMFERENCE_FACTOR = 2.7

# Reduced shrink factors (previously ~0.7) for better real-world fidelity
BUST_CALIBRATION = 0.94
WAIST_CALIBRATION = 0.93
HIPS_CALIBRATION = 0.95


def _measurement_confidence_level(avg_confidence: float, loose_clothing: bool) -> str:
    """Convert numeric confidence and clothing condition to quality band."""
    if loose_clothing:
        return "low"
    if avg_confidence >= 0.8:
        return "high"
    if avg_confidence >= 0.6:
        return "medium"
    return "low"

# Initialize FastAPI app
app = FastAPI(
    title="Body Measurement AI", 
    description="Extract body measurements from images using MediaPipe Pose"
)

# Initialize MediaPipe Pose
# We use model_complexity=2 for the highest accuracy estimation
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=True, 
    min_detection_confidence=0.5, 
    model_complexity=2,
    enable_segmentation=True
)

def calculate_distance(p1, p2, width_px, height_px):
    """Calculate Euclidean distance between two MediaPipe landmarks in pixels."""
    return math.sqrt(((p1.x - p2.x) * width_px)**2 + ((p1.y - p2.y) * height_px)**2)

def get_width_at_y(mask, y, img_w, img_h):
    """Finds the horizontal width of the mask slice at specific y coordinate. Focuses on core body region."""
    y = max(0, min(int(y), img_h - 1))
    row = mask[y]
    # Simple threshold-based segmentation to ignore loose clothing edges
    indices = np.where(row > MASK_THRESHOLD)[0]  # higher threshold for core body
    if len(indices) > 0:
        return (indices[-1] - indices[0])
    return 0

def extract_measurements_from_image(image_bytes: bytes, height_cm: float = 170.0) -> Dict[str, float]:
    """Helper function to process image bytes and return structured measurements."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise ValueError("Invalid image file provided.")
        
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    img_h, img_w, _ = image_rgb.shape
    
    results = pose.process(image_rgb)
    
    if not results.pose_landmarks or results.segmentation_mask is None:
        raise ValueError("No body landmarks or silhouette detected. Please ensure the full body is visible and well-lit.")
        
    landmarks = results.pose_landmarks.landmark
    mask = results.segmentation_mask
    
    # Required landmarks for confidence
    required_landmarks = [11, 12, 23, 24, 27, 28] # shoulders, hips, ankles
    confidence_scores = [landmarks[idx].visibility for idx in required_landmarks]
    avg_confidence = sum(confidence_scores) / len(confidence_scores)

    if avg_confidence < 0.4:
        raise ValueError("Please upload full-body image. Insufficient visibility of key points.")

    # 1. Proportional ratios
    def p(idx): return landmarks[idx]
    
    l_sh, r_sh = p(11), p(12)
    l_hip, r_hip = p(23), p(24)
    l_ankle, r_ankle = p(27), p(28)
    nose = p(0)
    
    sh_dist = calculate_distance(l_sh, r_sh, img_w, img_h)
    hip_dist = calculate_distance(l_hip, r_hip, img_w, img_h)
    
    mid_sh_y = ((l_sh.y + r_sh.y) / 2.0) * img_h
    mid_hip_y = ((l_hip.y + r_hip.y) / 2.0) * img_h
    torso_len = abs(mid_hip_y - mid_sh_y)
    
    mid_ankle_y = ((l_ankle.y + r_ankle.y) / 2.0) * img_h
    leg_len = abs(mid_ankle_y - mid_hip_y)
    
    full_body_px = abs(mid_ankle_y - (nose.y * img_h)) or 1.0

    # Ratios
    shoulder_to_hip_ratio = sh_dist / max(hip_dist, 1.0)
    leg_to_torso_ratio = leg_len / max(torso_len, 1.0)

    # 2. Normalization via assumed or provided height
    # Scale pixel values accordingly
    cm_per_px = height_cm / full_body_px
    
    # 3. Focus on core body region (ignore loose clothing)
    bust_y = int(mid_sh_y + (torso_len * 0.2)) 
    waist_y = int(mid_sh_y + (torso_len * 0.6))
    hips_y = int(mid_hip_y)
    
    bust_width_px = get_width_at_y(mask, bust_y, img_w, img_h)
    waist_width_px = get_width_at_y(mask, waist_y, img_w, img_h)
    hips_width_px = get_width_at_y(mask, hips_y, img_w, img_h)
    
    # Fallback to pure skeletal distances if mask is completely failed
    if bust_width_px == 0: bust_width_px = sh_dist * 1.2
    if waist_width_px == 0: waist_width_px = hip_dist * 0.9
    if hips_width_px == 0: hips_width_px = hip_dist * 1.2

    bust_cm = bust_width_px * cm_per_px * BUST_CIRCUMFERENCE_FACTOR
    waist_cm = waist_width_px * cm_per_px * WAIST_CIRCUMFERENCE_FACTOR
    hips_cm = hips_width_px * cm_per_px * HIPS_CIRCUMFERENCE_FACTOR
    
    # Check for loose clothing causing extreme hip mask width compared to shoulders
    shoulder_width_px = get_width_at_y(mask, int(mid_sh_y), img_w, img_h) or sh_dist
    loose_clothing_detected = (hips_width_px / max(shoulder_width_px, 1.0)) > 2.0
    
    # NEW LOGIC: Estimate body inside dress/frock
    # If the bottom is much wider than the geometric skeleton distance, we 
    # likely bounded a dense dress. Trust the MediaPipe skeleton inner joints!
    if hips_width_px > hip_dist * 2.0 or bust_width_px > sh_dist * 2.0:
        hips_width_px = hip_dist * 1.5  # Adjust explicitly for dress
        waist_width_px = hip_dist * 0.9 # Override waist width directly from skeleton to avoid fabric padding
        bust_width_px = sh_dist * 1.2   # Override bust width directly from skeleton
        loose_clothing_detected = True
        
    # Apply realistic calibration without collapsing body variation.
    # Replace static constants with dynamic confidence-based scaling
    scaling_factor = max(0.9, min(1.0, avg_confidence))
    bust_cm = bust_cm * scaling_factor
    waist_cm = waist_cm * scaling_factor
    hips_cm = hips_cm * scaling_factor

    waist_to_height_ratio = waist_cm / height_cm if height_cm > 0 else 1.0
    chest_to_waist_ratio = bust_cm / waist_cm if waist_cm > 0 else 1.0

    # 4. Body Type Classification (Ratio-based)
    if waist_to_height_ratio > 0.55:
        body_type = "plussize"
    elif chest_to_waist_ratio > 1.2:
        body_type = "athletic"
    elif waist_cm > bust_cm and waist_cm > hips_cm:
        body_type = "heavy"
    elif chest_to_waist_ratio < 1.05 and hips_cm / waist_cm < 1.1:
        body_type = "slim"
    else:
        body_type = "average"
        
    # 5. Gender Detection
    # New Logic: Face Priority via Hugging Face Inference API
    l_ear, r_ear = p(7), p(8)
    face_visible = l_ear.visibility > 0.6 and r_ear.visibility > 0.6 and nose.visibility > 0.6
    
    gender = "unknown"
    hf_confidence = 0.0
    hf_called = False
    or_skin_tone = None
    
    # Handle loose clothing overriding predictions
    if loose_clothing_detected:
        avg_confidence = max(0.1, avg_confidence - 0.2)  # Reduce confidence
        # Removed setting body_type to unknown so it provides a fallback shape!
        
    print(f"Face detected: {face_visible}")
    if face_visible:
        # Generate bounding box for face cropping to improve HF accuracy
        face_landmarks = [p(i) for i in range(11)]
        x_coords = [lm.x * img_w for lm in face_landmarks]
        y_coords = [lm.y * img_h for lm in face_landmarks]
        
        pad_x = (max(x_coords) - min(x_coords)) * 0.5
        pad_y = (max(y_coords) - min(y_coords)) * 0.5
        
        x_min = max(0, int(min(x_coords) - pad_x))
        x_max = min(img_w, int(max(x_coords) + pad_x))
        y_min = max(0, int(min(y_coords) - pad_y))
        y_max = min(img_h, int(max(y_coords) + pad_y))
        
        print(f"Face bounding box: {x_min, y_min, x_max, y_max}")
        
        # Crop face region
        face_crop = image[y_min:y_max, x_min:x_max]
        _, encoded_img = cv2.imencode('.jpg', face_crop)
        face_bytes = encoded_img.tobytes()

        # Send face crop to Hugging Face
        try:
            print("Sending image to Hugging Face API")
            API_URL = "https://router.huggingface.co/hf-inference/models/rizvandwiki/gender-classification-2"
            
            import os
            headers = {"Content-Type": "image/jpeg"}
            hf_token = os.environ.get("HUGGINGFACE_TOKEN")
            if hf_token:
                headers["Authorization"] = f"Bearer {hf_token}"
            
            hf_called = True
            response = requests.post(API_URL, headers=headers, data=face_bytes, timeout=5)
            
            if response.status_code == 200:
                predictions = response.json()
                print("HF Response:", predictions)
                if isinstance(predictions, list) and len(predictions) > 0:
                    best_pred = predictions[0]
                    
                    hf_confidence = best_pred.get("score", 0.0)
                    pred_label = best_pred.get("label", "").lower()
                    
                    print(f"Gender: {pred_label}")
                    print(f"Confidence: {hf_confidence}")
                    
                    if hf_confidence > 0.8:
                        # Map labels if needed (e.g., 'female', 'woman' -> 'female')
                        if "female" in pred_label or "woman" in pred_label:
                            gender = "female"
                        elif "male" in pred_label or "man" in pred_label:
                            gender = "male"
                        else:
                            gender = "unknown"
                    else:
                        print("Confidence too low, falling back to unknown")
                        gender = "unknown"
            else:
                print(f"HF API error: {response.status_code} - {response.text}")
                gender = "unknown"
        except Exception as e:
            print(f"HF API error: {e}")
            gender = "unknown"

        # Fallback to OpenRouter (vision model) if HF fails or low confidence
        if gender == "unknown":
            print("Falling back to OpenRouter API for gender inference...")
            try:
                import base64
                import json
                or_key = os.environ.get("OPENROUTER_API_KEY")
                if or_key:
                    b64_face = base64.b64encode(face_bytes).decode("utf-8")
                    or_url = "https://openrouter.ai/api/v1/chat/completions"
                    or_headers = {
                        "Authorization": f"Bearer {or_key}",
                        "HTTP-Referer": "http://localhost:8000"
                    }
                    or_payload = {
                        "model": "google/gemini-2.5-flash",
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": "Analyze this face. Return a JSON with exactly two keys: 'gender' (strictly 'male' or 'female') and 'skin_tone' (a descriptive string like 'fair', 'light', 'medium', 'tan', 'brown', 'dark', or 'deep'). No other text."},
                                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_face}"}}
                                ]
                            }
                        ]
                    }
                    or_res = requests.post(or_url, headers=or_headers, json=or_payload, timeout=10)
                    if or_res.status_code == 200:
                        or_data = or_res.json()
                        or_content = or_data["choices"][0]["message"]["content"]
                        # Strip potential markdown formatting
                        if or_content.startswith("```json"):
                            or_content = or_content[7:-3].strip()
                        elif or_content.startswith("```"):
                            or_content = or_content[3:-3].strip()

                        print(f"OpenRouter response: {or_content}")
                        parsed_or = json.loads(or_content)
                        returned_gender = parsed_or.get("gender", "unknown").lower()
                        if returned_gender in ["male", "female"]:
                            gender = returned_gender
                            hf_confidence = 0.9  # Set high confidence for LLM prediction
                            hf_called = True
                        
                        # Store skin tone to be passed out of this function
                        or_skin_tone = parsed_or.get("skin_tone", "").lower()
                    else:
                        print(f"OpenRouter API error: {or_res.status_code} - {or_res.text}")
                else:
                    print("No OPENROUTER_API_KEY found for fallback.")
            except Exception as or_e:
                print(f"OpenRouter fallback error: {or_e}")
                
    else:
        # If face is NOT clearly detected, fallback to unknown
        gender = "unknown"
            
    # Remove old body-based fallbacks entirely as requested.
        
    measurement_confidence = _measurement_confidence_level(avg_confidence, loose_clothing_detected)

    return {
        "height": round(height_cm, 1),
        "chest": round(bust_cm, 1),
        "waist": round(waist_cm, 1),
        "hips": round(hips_cm, 1),
        "body_type": body_type,
        "gender": gender,
        "gender_confidence": round(hf_confidence, 2) if hf_called else 0.0,
        "skin_tone_text": or_skin_tone,
        "face_detected": face_visible,
        "hf_called": hf_called,
        "shoulder_to_hip_ratio": round(shoulder_to_hip_ratio, 2),
        "leg_to_torso_ratio": round(leg_to_torso_ratio, 2),
        "loose_clothing_detected": loose_clothing_detected,
        "confidence": round(avg_confidence, 2),
        "measurement_confidence": measurement_confidence,
    }

@app.post("/measure-body")
async def measure_body(file: UploadFile = File(...)) -> Dict[str, float]:
    """
    Analyze an uploaded image and return estimated body measurements
    using calibrated pixel-to-cm conversion with confidence metadata.
    """
    try:
        contents = await file.read()
        return extract_measurements_from_image(contents)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Measurement extraction failed: {str(e)}")

# This allows the file to be run completely standalone locally
if __name__ == "__main__":
    import uvicorn
    print("Starting AI Body Measurement Service on http://0.0.0.0:8080...")
    uvicorn.run(app, host="0.0.0.0", port=8080)
