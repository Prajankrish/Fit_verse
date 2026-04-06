"""
Advanced Fit Engine - Production Grade
Evaluates all sizes with margin-ratio scoring, confidence calculation, and multi-size comparison.
"""

from typing import Dict, List, Tuple


class AdvancedFitEngine:
    """Predicts fit across all available sizes with detailed analytics."""

    # Standard size adjustments (cm) for chest measurements
    SIZE_ADJUSTMENTS = {
        "XS": -8,
        "S": -4,
        "M": 0,
        "L": 4,
        "XL": 8,
        "2XL": 12,
    }

    # Ideal fit parameters
    IDEAL_MARGIN = 3.0  # cm - optimal chest ease
    IDEAL_RATIO = 2.0   # height/length ratio

    def __init__(self):
        pass

    def predict_fit_all_sizes(
        self,
        user_chest: float,
        user_height: float,
        base_garment_chest: float,
        base_garment_length: float,
        available_sizes: List[str] = None,
    ) -> Dict:
        """
        Evaluate fit across all available sizes.

        Args:
            user_chest: User's chest/bust measurement (cm)
            user_height: User's height (cm)
            base_garment_chest: Garment chest measurement for size M (cm)
            base_garment_length: Garment length for size M (cm)
            available_sizes: List of available sizes (default: S, M, L, XL)

        Returns:
            Dict with results for each size, best size, and detailed analytics
        """

        if available_sizes is None:
            available_sizes = ["S", "M", "L", "XL"]

        # Evaluate each size
        size_results = {}
        for size in available_sizes:
            if size not in self.SIZE_ADJUSTMENTS:
                continue

            adjustment = self.SIZE_ADJUSTMENTS[size]
            garment_chest = base_garment_chest + adjustment
            garment_length = base_garment_length  # Length doesn't change with size typically

            # Compute margin and ratio
            margin = garment_chest - user_chest
            ratio = user_height / garment_length if garment_length > 0 else 0

            # Calculate score
            score = self._calculate_score(margin, ratio)

            # Width and length fit
            width_fit = self._evaluate_width_fit(margin)
            width_score = self._margin_to_score(margin)

            length_fit = self._evaluate_length_fit(ratio)
            length_score = self._ratio_to_score(ratio)

            size_results[size] = {
                "margin": margin,
                "ratio": ratio,
                "score": score,
                "width_fit": width_fit,
                "width_score": width_score,
                "length_fit": length_fit,
                "length_score": length_score,
            }

        # Find best size
        best_size = max(size_results.keys(), key=lambda s: size_results[s]["score"])
        best_score = size_results[best_size]["score"]
        best_result = size_results[best_size]

        # Calculate confidence (0-1)
        confidence = self._calculate_confidence(
            best_result["margin"], best_result["ratio"]
        )

        # Generate explanation
        explanation = self._generate_explanation(
            best_size,
            best_result["width_fit"],
            best_result["length_fit"],
            confidence,
        )

        return {
            "recommended_size": best_size,
            "score": best_score,
            "confidence": confidence,
            "width_fit": best_result["width_fit"],
            "length_fit": best_result["length_fit"],
            "width_score": best_result["width_score"],
            "length_score": best_result["length_score"],
            "explanation": explanation,
            "all_sizes": size_results,  # Include all sizes for UI comparison
        }

    def _calculate_score(self, margin: float, ratio: float) -> float:
        """
        Calculate fit score for a size.
        Score = 100 - abs(margin - 3)*8 - abs(ratio - 2.0)*20
        """
        margin_penalty = abs(margin - self.IDEAL_MARGIN) * 8
        ratio_penalty = abs(ratio - self.IDEAL_RATIO) * 20
        score = 100 - margin_penalty - ratio_penalty
        return max(0, min(100, score))

    def _evaluate_width_fit(self, margin: float) -> str:
        """
        Categorize width fit based on margin.
        margin < -6: Tight
        margin > 6: Loose
        else: Perfect
        """
        if margin < -6:
            return "Tight"
        elif margin > 6:
            return "Loose"
        else:
            return "Perfect"

    def _evaluate_length_fit(self, ratio: float) -> str:
        """
        Categorize length fit based on height/length ratio.
        ratio > 2.2: Short
        ratio < 1.8: Long
        else: Perfect
        """
        if ratio > 2.2:
            return "Short"
        elif ratio < 1.8:
            return "Long"
        else:
            return "Perfect"

    def _margin_to_score(self, margin: float) -> float:
        """Convert margin to 0-1 score (0.5 = perfect at margin=3)."""
        # Score peaks at margin=3
        penalty = abs(margin - self.IDEAL_MARGIN)
        score = max(0, 1 - (penalty / 15))
        return min(1.0, score)

    def _ratio_to_score(self, ratio: float) -> float:
        """Convert ratio to 0-1 score (0.5 = perfect at ratio=2.0)."""
        # Score peaks at ratio=2.0
        penalty = abs(ratio - self.IDEAL_RATIO)
        score = max(0, 1 - (penalty / 1.0))
        return min(1.0, score)

    def _calculate_confidence(self, margin: float, ratio: float) -> float:
        """
        Calculate confidence 0-1.
        confidence = 1 - (abs(margin - 3)/15 + abs(ratio - 2.0))/2
        Clamp between 0-1
        """
        margin_dev = abs(margin - self.IDEAL_MARGIN) / 15.0
        ratio_dev = abs(ratio - self.IDEAL_RATIO)
        confidence = 1 - (margin_dev + ratio_dev) / 2.0
        return max(0.0, min(1.0, confidence))

    def _generate_explanation(
        self, size: str, width_fit: str, length_fit: str, confidence: float
    ) -> str:
        """Generate a human-readable explanation of the fit."""
        quality = "excellent" if confidence > 0.8 else "good" if confidence > 0.5 else "fair"
        return f"Size {size} offers {quality} fit: {width_fit} width, {length_fit} length."

    def predict_fit_selected_size(
        self,
        user_chest: float,
        user_height: float,
        base_garment_chest: float,
        base_garment_length: float,
        selected_size: str,
    ) -> Dict:
        """
        Predict fit for a specific selected size and compare against recommendation.
        """

        # Get all sizes
        all_results = self.predict_fit_all_sizes(
            user_chest, user_height, base_garment_chest, base_garment_length
        )

        recommended_size = all_results["recommended_size"]

        # Evaluate the selected size
        if selected_size not in self.SIZE_ADJUSTMENTS:
            selected_size = recommended_size

        adjustment = self.SIZE_ADJUSTMENTS[selected_size]
        garment_chest = base_garment_chest + adjustment
        garment_length = base_garment_length

        margin = garment_chest - user_chest
        ratio = user_height / garment_length if garment_length > 0 else 0

        selected_score = self._calculate_score(margin, ratio)
        selected_confidence = self._calculate_confidence(margin, ratio)

        width_fit = self._evaluate_width_fit(margin)
        length_fit = self._evaluate_length_fit(ratio)

        # Build recommendation message
        recommendation_msg = ""
        if selected_size != recommended_size:
            rec_score = all_results["all_sizes"][recommended_size]["score"]
            improvement = rec_score - selected_score
            recommendation_msg = f"Better fit available: Size {recommended_size} (+{improvement:.0f} points)"

        return {
            "selected_size": selected_size,
            "score": selected_score,
            "confidence": selected_confidence,
            "width_fit": width_fit,
            "length_fit": length_fit,
            "width_score": self._margin_to_score(margin),
            "length_score": self._ratio_to_score(ratio),
            "recommended_size": recommended_size,
            "recommendation": recommendation_msg,
            "explanation": f"Size {selected_size} evaluates as {width_fit} in width and {length_fit} in length.",
            "all_sizes": all_results["all_sizes"],
            "margin": margin,
            "ratio": ratio,
        }
