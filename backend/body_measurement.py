import cv2
import mediapipe as mp
import numpy as np
import math
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict

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
    """Finds the horizontal width of the mask slice at specific y coordinate."""
    y = max(0, min(int(y), img_h - 1))
    row = mask[y]
    indices = np.where(row > 0.5)[0]
    if len(indices) > 0:
        return (indices[-1] - indices[0])
    return 0

def extract_measurements_from_image(image_bytes: bytes, height_cm: float = 170.0) -> Dict[str, float]:
    """Helper function to process image bytes and return measurements."""
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
    
    # 1. Image guidelines & Pose Validation
    # Ensure shoulders, hips, and ankles/knees are visible for a full body check
    required_landmarks = [
        (11, "left shoulder"), (12, "right shoulder"), 
        (23, "left hip"), (24, "right hip"),
        (27, "left ankle/knee"), (28, "right ankle/knee") # At least knees should be detected
    ]
    
    confidence_scores = []
    for idx, name in required_landmarks:
        lm = landmarks[idx]
        confidence_scores.append(lm.visibility)
        if lm.visibility < 0.4:
            raise ValueError(f"Insufficient visibility of {name}. Please upload a front-facing full-body photo with good lighting.")
            
    # Check if posture is mostly front-facing 
    l_sh = landmarks[11]
    r_sh = landmarks[12]
    
    shoulder_width = abs(l_sh.x - r_sh.x)
    shoulder_depth = abs(l_sh.z - r_sh.z)
    
    # If depth is significant compared to width, user might be turned to the side
    if shoulder_depth > shoulder_width * 0.9:
        raise ValueError("The pose appears to be angled. For accurate measurements, please face the camera directly.")
    
    # Compute overall pose confidence
    avg_confidence = sum(confidence_scores) / len(confidence_scores)
    
    mask = results.segmentation_mask
    
    l_sh = landmarks[11]
    r_sh = landmarks[12]
    l_hip = landmarks[23]
    r_hip = landmarks[24]
    
    mid_sh_x = ((l_sh.x + r_sh.x) / 2.0) * img_w
    mid_sh_y = ((l_sh.y + r_sh.y) / 2.0) * img_h
    mid_hip_x = ((l_hip.x + r_hip.x) / 2.0) * img_w
    mid_hip_y = ((l_hip.y + r_hip.y) / 2.0) * img_h
    
    skeletal_shoulder_px = calculate_distance(l_sh, r_sh, img_w, img_h)
    skeletal_hip_px = calculate_distance(l_hip, r_hip, img_w, img_h)

    torso_height_px = math.sqrt((mid_sh_x - mid_hip_x)**2 + (mid_sh_y - mid_hip_y)**2)
    
    # Calculate a much more accurate cm_per_px baseline utilizing the full body length if passing height_cm
    nose = landmarks[0]
    l_ankle = landmarks[27]
    r_ankle = landmarks[28]
    mid_ankle_y = ((l_ankle.y + r_ankle.y) / 2.0) * img_h
    nose_y = nose.y * img_h
    full_body_px = max(mid_ankle_y - nose_y, 1.0)
    
    cm_per_px_full = height_cm / full_body_px * 0.95  # 0.95 accounts for head top and shoes
    
    # Base fallback in case full body wasn't fully perfectly mapped
    cm_per_px_torso = 42.0 / max(torso_height_px, 1.0)
    cm_per_px_shoulder = 38.0 / max(skeletal_shoulder_px, 1.0)
    
    # Blend them for greater stability, weighing the exact height_cm highly
    cm_per_px = (cm_per_px_full * 0.7) + (cm_per_px_torso * 0.15) + (cm_per_px_shoulder * 0.15)
    
    # Intelligent Outlier Rejection via Mask Density (Fill Ratio)
    # We calculate the bounding box fill ratio of the mask to distinguish thick bodies from A-line dresses
    mask_bin = (mask > 0.5).astype(np.uint8)
    cols = np.any(mask_bin, axis=0)
    rows = np.any(mask_bin, axis=1)
    if len(np.where(cols)[0]) > 0 and len(np.where(rows)[0]) > 0:
        x_min, x_max = np.where(cols)[0][[0, -1]]
        y_min, y_max = np.where(rows)[0][[0, -1]]
        bbox_area = max((x_max - x_min) * (y_max - y_min), 1)
        fill_ratio = np.sum(mask_bin) / bbox_area
    else:
        fill_ratio = 0.5
    
    # Identify bust, waist, and hips Y coordinates
    bust_y = int(mid_sh_y + (img_h * 0.05)) # slightly below shoulders
    waist_y = int(mid_sh_y + (torso_height_px * 0.6)) # middle-lower torso
    hips_y = int(mid_hip_y + (img_h * 0.02)) # at or slightly below hip joints
    
    # Extract physical pixel widths from mask
    bust_width_px = get_width_at_y(mask, bust_y, img_w, img_h)
    waist_width_px = get_width_at_y(mask, waist_y, img_w, img_h)
    hips_width_px = get_width_at_y(mask, hips_y, img_w, img_h)
    shoulder_width_px = get_width_at_y(mask, mid_sh_y, img_w, img_h)
    
    if fill_ratio > 0.55:
        # User mask fills the bounding box thickly vertically and horizontally.
        shoulder_width_px = min(shoulder_width_px, skeletal_shoulder_px * 1.8)
    else:
        # Fill ratio < 0.55 might indicate roughly an A-line shape gown.
        # Plus-size bodies naturally have bust/hips much wider than their shoulders.
        # We must allow bust and hips to be up to 2.2x the skeletal_shoulder to accommodate curvy/plus-size.
        if bust_width_px > skeletal_shoulder_px * 2.2 or bust_width_px == 0:
            bust_width_px = skeletal_shoulder_px * 1.5
        if waist_width_px > skeletal_hip_px * 2.2 or waist_width_px == 0:
            waist_width_px = skeletal_shoulder_px * 1.2
        if hips_width_px > skeletal_hip_px * 2.5 or hips_width_px == 0:
            hips_width_px = skeletal_shoulder_px * 1.4
        if shoulder_width_px > skeletal_shoulder_px * 1.6 or shoulder_width_px == 0:
            shoulder_width_px = skeletal_shoulder_px * 1.2
    
    bust_width_cm = bust_width_px * cm_per_px
    waist_width_cm = waist_width_px * cm_per_px
    hips_width_cm = hips_width_px * cm_per_px
    shoulder_width_cm = shoulder_width_px * cm_per_px
    
    # Realistic depth-to-width elliptical multipliers for front-facing photos (C ≈ 2.6w)
    # Research papers (e.g. 3D Body Scanning data) suggest ~2.6-2.7 for chests, ~2.5-2.6 for waists, ~2.6-2.8 for hips
    chest_multiplier = 2.65
    waist_multiplier = 2.58
    hips_multiplier = 2.70
    
    chest_cm = bust_width_cm * chest_multiplier
    waist_cm = waist_width_cm * waist_multiplier
    hips_cm = hips_width_cm * hips_multiplier
    
    # Allow larger clamp sizes for plus-size inclusivity
    def clamp(val, min_val, max_val):
        return max(min_val, min(max_val, val))

    return {
        "chest": round(clamp(chest_cm, 75.0, 200.0), 1),
        "waist": round(clamp(waist_cm, 55.0, 180.0), 1),
        "hips": round(clamp(hips_cm, 80.0, 200.0), 1),
        "shoulder_width": round(clamp(shoulder_width_cm, 35.0, 80.0), 1),
        "confidence": round(avg_confidence, 2)
    }

@app.post("/measure-body")
async def measure_body(file: UploadFile = File(...)) -> Dict[str, float]:
    """
    Analyze an uploaded image and return estimated body measurements
    normalized to realistic centimeter ranges.
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
