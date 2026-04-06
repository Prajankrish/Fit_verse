import mediapipe as mp
import cv2
import numpy as np
from typing import Dict, Tuple, Optional
import math

class BodyAnalyzer:
    """
    Analyzes body proportions and measurements from images using MediaPipe.
    Extracts pose keypoints to estimate body dimensions.
    """
    
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        # Use model_complexity=0 (fastest) instead of 2 (slowest)
        # 0 = 30ms, 1 = 70ms, 2 = 150ms per inference - 10x difference!
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=0,  # CHANGED: was 2 (slowest)
            smooth_landmarks=False,  # Disable smoothing - adds overhead
            enable_segmentation=True, # Added to track actual body mass
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
    def analyze_image(self, image_path: str) -> Dict:
        """
        Analyze body proportions from an image.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary with extracted measurements and body proportions
        """
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        
        # OPTIMIZATION: Downscale image for faster processing
        # MediaPipe doesn't need full resolution - scales results back automatically
        original_h, original_w = image.shape[:2]
        max_dimension = 480  # Process at most 480px wide (10x smaller = 100x faster area)
        if max(original_h, original_w) > max_dimension:
            scale = max_dimension / max(original_h, original_w)
            image = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_LINEAR)
        
        h, w, c = image.shape
        
        # Detect pose
        results = self.pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        if not results.pose_landmarks:
            raise ValueError("No pose detected in image. Ensure full body is visible.")
        
        landmarks = results.pose_landmarks.landmark
        
        # Extract key measurements
        measurements = self._calculate_measurements(landmarks, h, w)
        measurements['confidence'] = self._calculate_detection_confidence(results)
        
        if results.segmentation_mask is not None:
            mask = results.segmentation_mask > 0.5
            if np.any(mask):
                rows = np.any(mask, axis=1)
                cols = np.any(mask, axis=0)
                rmin, rmax = np.where(rows)[0][0], np.where(rows)[0][-1]
                cmin, cmax = np.where(cols)[0][0], np.where(cols)[0][-1]
                p_h = float(rmax - rmin)
                p_w = float(cmax - cmin)
                if p_h > 0:
                    measurements['person_aspect_ratio'] = p_w / p_h
                    measurements['fill_ratio'] = float(np.sum(mask)) / (p_w * p_h)
        
        return measurements
    
    def _calculate_measurements(self, landmarks, image_height: int, image_width: int) -> Dict:
        """
        Calculate body measurements from pose landmarks.
        MediaPipe landmarks: 0=nose, 11=left_shoulder, 12=right_shoulder, etc.
        """
        
        # Key landmark indices
        NOSE = 0
        LEFT_SHOULDER = 11
        RIGHT_SHOULDER = 12
        LEFT_HIP = 23
        RIGHT_HIP = 24
        LEFT_ANKLE = 27
        RIGHT_ANKLE = 28
        LEFT_KNEE = 25
        RIGHT_KNEE = 26
        LEFT_WRIST = 9
        RIGHT_WRIST = 10
        
        # Extract coordinates (normalized 0-1)
        def get_point(idx):
            l = landmarks[idx]
            return (l.x * image_width, l.y * image_height)
        
        # Calculate distances in pixels (we'll normalize to cm later)
        def distance(p1, p2):
            return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)
        
        # Key measurements
        shoulder_width = distance(get_point(LEFT_SHOULDER), get_point(RIGHT_SHOULDER))
        torso_length = distance(get_point(LEFT_SHOULDER), get_point(LEFT_HIP))
        left_leg_length = distance(get_point(LEFT_HIP), get_point(LEFT_ANKLE))
        right_leg_length = distance(get_point(RIGHT_HIP), get_point(RIGHT_ANKLE))
        total_height = distance(get_point(NOSE), 
                                get_point(LEFT_ANKLE) if landmarks[LEFT_ANKLE].visibility > 0.5 
                                else get_point(RIGHT_ANKLE))
        
        arm_length = distance(get_point(LEFT_SHOULDER), get_point(LEFT_WRIST))
        
        # Calculate proportions (ratios are scale-invariant)
        leg_to_torso_ratio = (left_leg_length + right_leg_length) / 2 / torso_length if torso_length > 0 else 0
        shoulder_to_hip_ratio = shoulder_width / distance(get_point(LEFT_HIP), get_point(RIGHT_HIP))
        
        return {
            'shoulder_width_px': shoulder_width,
            'torso_length_px': torso_length,
            'leg_length_px': (left_leg_length + right_leg_length) / 2,
            'total_height_px': total_height,
            'arm_length_px': arm_length,
            'leg_to_torso_ratio': leg_to_torso_ratio,
            'shoulder_to_hip_ratio': shoulder_to_hip_ratio,
            'leftness': landmarks[LEFT_SHOULDER].visibility,
            'pose_quality': 'full_body' if (
                max(landmarks[LEFT_ANKLE].visibility, landmarks[RIGHT_ANKLE].visibility) > 0.5 and 
                landmarks[NOSE].visibility > 0.5
            ) else 'partial'
        }
    
    def _calculate_detection_confidence(self, results) -> float:
        """
        Calculate overall confidence of pose detection (0-1).
        Based on visibility of key landmarks.
        """
        key_landmarks = [0, 11, 12, 23, 24, 27, 28]  # nose, shoulders, hips, ankles
        visibilities = [results.pose_landmarks.landmark[i].visibility for i in key_landmarks]
        return np.mean(visibilities)

class HeightEstimator:
    """
    Estimates users's actual height in cm from image proportions and pose.
    Uses reference objects or standard human proportions.
    """
    
    @staticmethod
    def estimate_height_from_proportions(measurements: Dict, average_height: float = 165) -> float:
        """
        Estimates height using body proportions.
        For final year project, uses average height as reference.
        
        Args:
            measurements: Output from BodyAnalyzer
            average_height: Reference height in cm (default: global average)
            
        Returns:
            Estimated height in cm
        """
        # For a more accurate system, you'd use:
        # 1. Reference objects in image (doorway, coins, etc.)
        # 2. Camera focal length and distance
        # 3. ML model trained on actual height data
        
        # For MVP: use average height as baseline and adjust by leg-to-torso ratio
        standard_leg_to_torso_ratio = 1.35  # typical adult leg-to-torso ratio
        measured_ratio = measurements.get('leg_to_torso_ratio', standard_leg_to_torso_ratio)
        
        # Avoid extreme height estimates: use damping factor
        # People with longer legs can be taller, but cap the adjustment
        # Formula: vary height by at most +/- 15cm from average based on leg ratio
        ratio_difference = (measured_ratio - standard_leg_to_torso_ratio) / standard_leg_to_torso_ratio
        
        # Heuristic: men are generally taller than women, and often have slightly different baseline ratios,
        # but since we want realistically scaled models without gender bias yet, we keep adjustment reasonable.
        max_adjustment = 15  # max ±15cm from average
        height_adjustment = max(150, min(220, average_height + (ratio_difference * max_adjustment)))
        
        return height_adjustment

# Export
__all__ = ['BodyAnalyzer', 'HeightEstimator']
