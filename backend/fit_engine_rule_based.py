from typing import Dict, Any

def get_fit_label_for_measurement(diff: float, size_type: str = "chest") -> str:
    """
    Determine fit label using advanced ease allowance principles.
    diff = user_measurement - product_measurement (Negative diff means positive ease).
    T-shirts mathematically should have positive ease (2-8cm extra fabric) to fit perfectly.
    """
    ease = -diff # garment - user
    
    # Adjust thresholds based on the exact garment section size requirements
    if size_type == "chest":
        if ease < -10: return "Extremely Tight"
        elif ease < -3: return "Very Tight"
        elif ease < 1.5: return "Snug/Tight"
        elif ease > 15: return "Extremely Loose"
        elif ease > 10: return "Very Loose"
        elif ease > 6: return "Slightly Loose"
        else: return "Perfect"
    else: # Waist thresholds (waist has different tolerance)
        if ease < -8: return "Extremely Tight"
        elif ease < -2: return "Very Tight"
        elif ease < 1.5: return "Snug"
        elif ease > 14: return "Extremely Loose"
        elif ease > 10: return "Very Loose"
        elif ease > 6: return "Slightly Loose"
        else: return "Perfect"

def predict_fit(user_measurements: Dict[str, float], product_measurements: Dict[str, float]) -> Dict[str, Any]:
    """
    Predicts fit based on user and product measurements.
    
    Args:
        user_measurements (Dict): e.g., {"chest": 95, "waist": 80}
        product_measurements (Dict): e.g., {"chest": 95, "waist": 85}
        
    Returns:
        Dict format with advanced nuanced scores
    """
    chest_diff = user_measurements.get("chest", 0) - product_measurements.get("chest", 0)
    waist_diff = user_measurements.get("waist", 0) - product_measurements.get("waist", 0)
    
    chest_ease = -chest_diff
    waist_ease = -waist_diff
    
    # Generate labels
    chest_label = get_fit_label_for_measurement(chest_diff, "chest")
    waist_label = get_fit_label_for_measurement(waist_diff, "waist")
    
    # Advanced exponential decay scoring to reflect human comfort
    def calculate_dimension_penalty(ease, is_chest=True):
        if is_chest:
            if 2 <= ease <= 8: return 0 # Perfect spot
            if ease < 2: return abs(ease - 2) * 5 # Tightness penalty is steep
            return abs(ease - 8) * 2 # Looseness penalty is gradual
        else:
            if 2 <= ease <= 8: return 0
            if ease < 2: return abs(ease - 2) * 5.5
            return abs(ease - 8) * 1.5
            
    chest_penalty = calculate_dimension_penalty(chest_ease, True)
    waist_penalty = calculate_dimension_penalty(waist_ease, False)
    
    score = 100 - chest_penalty - waist_penalty
    score = max(0, min(100, score))
    
    # Overall fit determination
    chest_tight = "Tight" in chest_label
    waist_tight = "Tight" in waist_label
    chest_loose = "Loose" in chest_label
    waist_loose = "Loose" in waist_label
    
    if chest_tight and waist_loose:
        overall_fit = "Tight Chest, Loose Waist"
    elif waist_tight and chest_loose:
        overall_fit = "Loose Chest, Tight Waist"
    elif chest_tight or waist_tight:
        if "Extremely" in chest_label or "Extremely" in waist_label:
            overall_fit = "Extremely Tight"
        elif "Very" in chest_label or "Very" in waist_label:
            overall_fit = "Very Tight"
        else:
            overall_fit = "Slightly Tight"
    elif chest_loose or waist_loose:
        if "Extremely" in chest_label or "Extremely" in waist_label:
            overall_fit = "Extremely Loose"
        elif "Very" in chest_label or "Very" in waist_label:
            overall_fit = "Very Loose"
        else:
            overall_fit = "Slightly Loose"
    else:
        overall_fit = "Perfect"
        
    # Expert size scaling recommendation
    advice = ""
    if chest_ease < 2 or waist_ease < 2:
        needed_sizes_up = max(int((5 - chest_ease)/4.5), int((5 - waist_ease)/4.5))
        if needed_sizes_up > 3:
            advice = "Consider a Plus Size range or alternative fit"
        elif needed_sizes_up >= 1:
            advice = f"Try {needed_sizes_up} size{'s' if needed_sizes_up > 1 else ''} UP"
        else:
            advice = "Consider sizing UP"
    elif chest_ease > 12 or waist_ease > 14:
        needed_sizes_down = max(int((chest_ease - 8)/4.5), int((waist_ease - 10)/4.5))
        if needed_sizes_down > 3:
            advice = "Consider alternative fit (garment too oversized)"
        elif needed_sizes_down >= 1:
            advice = f"Try {needed_sizes_down} size{'s' if needed_sizes_down > 1 else ''} DOWN"
        else:
            advice = "Consider sizing DOWN"
    else:
        advice = "Perfect Size Match"

    return {
        "fit": overall_fit,
        "score": round(score),
        "details": {
            f"chest (Gap: {round(chest_ease, 1)}cm)": chest_label,
            f"waist (Gap: {round(waist_ease, 1)}cm)": waist_label,
            "AI Advice": advice
        }
    }
