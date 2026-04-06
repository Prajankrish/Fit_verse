from typing import Any, Dict

# Fit band thresholds in centimeters.
VERY_LOOSE_MIN_MARGIN = 8.0
LOOSE_MIN_MARGIN = 4.0
PERFECT_MIN_MARGIN = 0.0
SLIGHTLY_TIGHT_MIN_MARGIN = -4.0

# Asymmetric scoring penalties.
LOOSE_PENALTY_PER_CM = 4.0
TIGHT_PENALTY_PER_CM = 10.0

# Weighted importance for tops.
CHEST_WEIGHT = 0.70
WAIST_WEIGHT = 0.30


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _fit_label_from_margin(margin: float) -> str:
    """Classify fit using garment-minus-body margin in cm."""
    if margin >= VERY_LOOSE_MIN_MARGIN:
        return "Very Loose"
    if margin >= LOOSE_MIN_MARGIN:
        return "Loose"
    if margin >= PERFECT_MIN_MARGIN:
        return "Perfect"
    if margin >= SLIGHTLY_TIGHT_MIN_MARGIN:
        return "Slightly Tight"
    return "Tight"


def _score_from_margin(margin: float) -> float:
    """Asymmetric score: tightness is penalized harder than looseness."""
    if margin >= 0:
        raw = 100.0 - (margin * LOOSE_PENALTY_PER_CM)
    else:
        raw = 100.0 + (margin * TIGHT_PENALTY_PER_CM)
    return _clamp(raw, 0.0, 100.0)


def _recommendation(chest_margin: float, waist_margin: float, overall_fit: str) -> str:
    """Generate human-readable recommendation text."""
    if chest_margin < -4:
        return "Too tight around chest, consider larger size"
    if chest_margin < 0:
        return "Slight chest tightness; size up for comfort"
    if chest_margin >= 8 and waist_margin >= 8:
        return "Size down for better fit"
    if overall_fit in {"Loose", "Very Loose"}:
        return "Good fit for relaxed style"
    return "Balanced fit for daily wear"


def predict_fit(
    user_measurements: Dict[str, float],
    product_measurements: Dict[str, float],
) -> Dict[str, Any]:
    """
    Predict fit quality from body and garment measurements.

    Expected input units: centimeters (circumference values for chest/waist).
    Supports optional stretch_factor in range [0, 1], where 1.0 means highly
    stretchable fabric and increases effective garment margin.
    """
    user_chest = float(user_measurements.get("chest", user_measurements.get("bust", 90.0)))
    user_waist = float(user_measurements.get("waist", 70.0))

    garment_chest = float(product_measurements.get("chest", product_measurements.get("bust", 90.0)))
    garment_waist = float(product_measurements.get("waist", 70.0))

    stretch_factor = float(product_measurements.get("stretch_factor", 0.0))
    stretch_factor = _clamp(stretch_factor, 0.0, 1.0)

    # Stretch contributes extra usable room before tightness starts.
    stretch_chest_allowance = garment_chest * 0.05 * stretch_factor
    stretch_waist_allowance = garment_waist * 0.05 * stretch_factor

    chest_margin = (garment_chest + stretch_chest_allowance) - user_chest
    waist_margin = (garment_waist + stretch_waist_allowance) - user_waist

    chest_fit = _fit_label_from_margin(chest_margin)
    waist_fit = _fit_label_from_margin(waist_margin)

    chest_score = _score_from_margin(chest_margin)
    waist_score = _score_from_margin(waist_margin)

    weighted_score = (chest_score * CHEST_WEIGHT) + (waist_score * WAIST_WEIGHT)
    final_score = int(round(_clamp(weighted_score, 0.0, 100.0)))

    overall_fit = chest_fit
    if chest_fit == "Perfect" and waist_fit in {"Loose", "Very Loose"}:
        overall_fit = "Loose"
    elif chest_fit in {"Slightly Tight", "Tight"}:
        overall_fit = chest_fit

    confidence = 0.92
    if stretch_factor > 0.6:
        confidence -= 0.06
    if abs(chest_margin) > 16 or abs(waist_margin) > 16:
        confidence -= 0.08
    confidence = round(_clamp(confidence, 0.5, 0.98), 2)

    return {
        "fit": overall_fit,
        "score": final_score,
        "confidence": confidence,
        "details": {
            "chest_margin": round(chest_margin, 2),
            "waist_margin": round(waist_margin, 2),
            "chest_fit": chest_fit,
            "waist_fit": waist_fit,
        },
        "recommendation": _recommendation(chest_margin, waist_margin, overall_fit),
    }
