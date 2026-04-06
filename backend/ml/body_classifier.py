import numpy as np
from typing import Dict, Tuple
from sklearn.preprocessing import StandardScaler
import pickle
import os

class BodyTypeClassifier:
    """
    Classifies body type based on body measurements and proportions.
    Uses rule-based classification for MVP (no complex ML needed).
    
    Body Types:
    - Slim: Low shoulder-to-hip ratio, thin proportions
    - Average: Balanced proportions, moderate measurements
    - Athletic: High muscle definition indicators, broad shoulders
    - Muscular: Very broad shoulders, defined physique
    - Curvy: High hip-to-waist ratio, feminine proportions
    - Plus-size: Larger overall measurements
    - Petite: Short height with proportional scaling
    - Tall: Tall height with long limbs
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self._init_thresholds()
    
    def _init_thresholds(self):
        """Initialize classification thresholds based on body proportions."""
        # These are normalized ratios, not absolute measurements
        # They're based on standard anthropometric data
        self.thresholds = {
            'shoulder_to_hip_ratio': {
                'narrow': (0, 0.9),
                'average': (0.9, 1.1),
                'broad': (1.1, 2.0)
            },
            'leg_to_torso_ratio': {
                'short': (0, 0.45),
                'average': (0.45, 0.52),
                'long': (0.52, 2.0)
            },
            'waist_to_hip_ratio': {
                'very_curvy': (0, 0.65),
                'curvy': (0.65, 0.75),
                'athletic': (0.75, 0.85),
                'straight': (0.85, 1.0)
            },
            'bmi_equivalent': {
                'slim': (0, 20),
                'average': (20, 25),
                'athletic': (20, 27),
                'muscular': (23, 30),
                'curvy': (20, 28),
                'plus_size': (28, 100)
            }
        }
    
    def classify(self, measurements: Dict, height_cm: float, 
                 estimated_weight: float = None) -> Tuple[str, float]:
        """
        Classify body type from measurements.
        
        Args:
            measurements: Dict from BodyAnalyzer with proportions
            height_cm: Estimated height in cm
            estimated_weight: Optional weight in kg (would require additional analysis)
            
        Returns:
            Tuple of (body_type, confidence)
        """
        # Let's fix the default for leg_to_torso which was erroneously set to 0.48 (leg_to_height) previously.
        # Now we know it ranges from 1.1 to 1.7
        shoulder_to_hip = measurements.get('shoulder_to_hip_ratio', 1.0)
        leg_to_torso = measurements.get('leg_to_torso_ratio', 1.35)
        
        # Determine height classification
        height_class = self._classify_height(height_cm)
        
        # Determine proportions
        proportions_class = self._classify_proportions(shoulder_to_hip, leg_to_torso)
        
        # Combine to determine body type
        body_type, confidence = self._combine_classifications(
            proportions_class, height_class, measurements
        )
        
        # Override with mass heuristics from segmentation 
        person_ar = measurements.get('person_aspect_ratio', 0)
        fill_ratio = measurements.get('fill_ratio', 0)
        pose_quality = measurements.get('pose_quality', 'partial')
        
        if pose_quality == 'full_body':
            if person_ar > 0.40 and fill_ratio > 0.45:
                body_type = 'plussize'
                confidence = 0.90
            elif person_ar > 0.35 and fill_ratio > 0.4:
                body_type = 'curvy'
                confidence = 0.85
            
        return body_type, confidence

    def detect_gender(self, measurements: Dict) -> Tuple[str, float]:
        """
        Detect gender from body proportions and silhouette.
        Uses face heuristic if available, else shoulder-to-hip ratio.
        """
        
        confidence = measurements.get('confidence', 0.5)
        if confidence < 0.7:
            return 'unisex', confidence
            
        real_shoulder_to_hip = measurements.get('shoulder_to_hip_ratio', 1.0)
        person_ar = measurements.get('person_aspect_ratio', 0)
        fill_ratio = measurements.get('fill_ratio', 0)
        pose_quality = measurements.get('pose_quality', 'partial')
        
        # Heavy builds obscure skeletal shoulder-to-hip
        if pose_quality == 'full_body' and (person_ar > 0.35 or fill_ratio > 0.4):
            if real_shoulder_to_hip > 1.05:
                return 'male', 0.7
            elif real_shoulder_to_hip < 0.95:
                return 'female', 0.7
            else:
                return 'unisex', 0.6
        
        # We don't have facial processing integrated efficiently in the current mediapipe pose,
        # so relying on shoulder_to_hip_ratio exclusively for now.
        if real_shoulder_to_hip > 1.2:
            gender = 'male'
            confidence = 0.8
        elif real_shoulder_to_hip < 1.0:
            gender = 'female'
            confidence = 0.8
        else:
            gender = 'unisex'
            confidence = 0.6

        return gender, confidence
    
    def _classify_height(self, height_cm: float) -> str:
        """Classify based on height."""
        if height_cm < 155:
            return 'petite'
        elif height_cm > 180:
            return 'tall'
        else:
            return 'average_height'
    
    def _classify_proportions(self, shoulder_ratio: float, leg_ratio: float) -> str:
        """Classify proportions using leg_to_torso_ratio (typ. 1.1-1.7)."""
        
        # If shoulder ratio is extremely high (>1.4), the hips are likely hidden under a dress.
        # We assume slim/average female proportions as a safe fallback rather than athletic/muscular
        if shoulder_ratio > 1.4:
            return 'slim' if leg_ratio > 1.35 else 'average'
            
        # Broad shoulders + average legs = athletic/muscular
        if shoulder_ratio > 1.05 and 1.2 < leg_ratio < 1.45:
            return 'athletic'
        
        # Narrow shoulders + long legs = slim
        elif shoulder_ratio < 0.95 and leg_ratio > 1.35:
            return 'slim'
        
        # Balanced = average
        elif 0.9 < shoulder_ratio < 1.1 and 1.2 < leg_ratio < 1.45:
            return 'average'
        
        # Long legs but not narrow shoulders
        elif leg_ratio >= 1.45:
            return 'slim'
            
        else:
            return 'average'
    
    def _combine_classifications(self, proportions: str, height: str, 
                                measurements: Dict) -> Tuple[str, float]:
        """Combine classifications to determine final body type."""
        
        confidence_score = 0.75  # base confidence
        
        # Height modifiers
        if height == 'petite':
            if proportions == 'average':
                return 'petite', 0.85
            else:
                return 'petite', 0.75
        
        elif height == 'tall':
            if proportions == 'athletic':
                return 'athletic', 0.85
            elif proportions == 'slim':
                return 'slim', 0.82
            else:
                return 'tall', 0.75
        
        # Standard heights
        else:
            if proportions == 'athletic':
                return 'athletic', 0.82
            elif proportions == 'slim':
                return 'slim', 0.80
            else:
                return 'average', 0.78
    
    def estimate_measurements(self, measurements: Dict, height_cm: float, 
                             body_type: str) -> Dict:
        """
        Estimate full body measurements from proportions and height.
        Calculates ACTUAL CIRCUMFERENCES (not just 2D width) for accurate garment fitting.
        Uses regression based on body type.
        
        Returns:
            Dict with estimated measurements in cm
        """
        
        # Estimated shoulder width (point-to-point, roughly 23-25% of height)
        shoulder_width = height_cm * 0.24
        
        # Estimated torso length
        torso_length = height_cm * 0.38
        
        # Estimated leg length
        leg_length = height_cm * 0.48
        
        # Bust/Chest CIRCUMFERENCE (average is ~50-55% of height)
        body_type_multipliers = {
            'slim': 0.48,
            'average': 0.52,
            'athletic': 0.56,
            'muscular': 0.60,
            'curvy': 0.54,
            'plus-size': 0.65,
            'petite': 0.52,
            'tall': 0.51
        }
        
        multiplier = body_type_multipliers.get(body_type, 0.52)
        bust = height_cm * multiplier
        
        # Waist CIRCUMFERENCE (typically 40-45% of height, varies a lot by body type)
        if body_type in ['curvy', 'hourglass']:
            waist = bust * 0.75  # Smaller waist ratio for curvy
        elif body_type in ['athletic', 'slim']:
            waist = bust * 0.82
        elif body_type == 'plus-size':
            waist = bust * 0.90
        else:
            waist = bust * 0.85
            
        # Hips CIRCUMFERENCE (varies significantly by body type)
        if body_type == 'curvy':
            hips = bust * 1.15  # Curvy: hips noticeably fuller than bust
        elif body_type == 'athletic':
            hips = bust * 0.95  # Athletic: hips narrower
        elif body_type == 'plus-size':
            hips = bust * 1.10
        else:
            hips = bust * 1.05   # Average: slightly larger than chest for both genders typically
        
        # Inseam (typically leg_length * 0.95 or height * ~0.45)
        inseam = height_cm * 0.45
        
        return {
            'height': height_cm,
            'bust': round(bust, 1),
            'waist': round(waist, 1),
            'hips': round(hips, 1),
            'shoulder_width': round(shoulder_width, 1),
            'torso_length': round(torso_length, 1),
            'leg_length': round(leg_length, 1),
            'inseam': round(inseam, 1)
        }

# Export
__all__ = ['BodyTypeClassifier']
