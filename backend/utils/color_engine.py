"""
Color Recommendation Engine
Analyzes skin tone and suggests complementary colors based on color theory
"""

from typing import List, Dict, Tuple
import colorsys


class ColorEngine:
    """
    Provides color harmony analysis and recommendations based on skin tone (HSL)
    Implements color theory principles: complementary, analogous, triadic, split-complementary
    """

    # Color families for style categorization
    COLOR_PALETTES = {
        "warm": {
            "name": "Warm Tones",
            "description": "Golden, warm, and earthy colors",
            "colors": [
                {"name": "Warm Gold", "hex": "#D4A574", "hsl": "30 45% 60%"},
                {"name": "Burnt Orange", "hex": "#CC5500", "hsl": "12 100% 40%"},
                {"name": "Terracotta", "hex": "#CD5C5C", "hsl": "0 52% 60%"},
                {"name": "Warm Brown", "hex": "#8B6F47", "hsl": "30 30% 50%"},
                {"name": "Warm Beige", "hex": "#F5DEB3", "hsl": "35 77% 85%"},
                {"name": "Coral", "hex": "#FF7F50", "hsl": "16 100% 70%"},
                {"name": "Rust", "hex": "#B7410E", "hsl": "16 83% 40%"},
                {"name": "Ochre", "hex": "#CC7000", "hsl": "27 100% 40%"},
            ],
        },
        "cool": {
            "name": "Cool Tones",
            "description": "Blue-based, cool, and icy colors",
            "colors": [
                {"name": "Cool Silver", "hex": "#D3D3D3", "hsl": "0 0% 83%"},
                {"name": "Steel Blue", "hex": "#4682B4", "hsl": "210 71% 47%"},
                {"name": "Navy", "hex": "#000080", "hsl": "240 100% 25%"},
                {"name": "Icy Blue", "hex": "#B0E0E6", "hsl": "180 69% 73%"},
                {"name": "Cool Gray", "hex": "#A9A9A9", "hsl": "0 0% 66%"},
                {"name": "Periwinkle", "hex": "#CCCCFF", "hsl": "240 100% 90%"},
                {"name": "Ice Blue", "hex": "#00FFFF", "hsl": "180 100% 50%"},
                {"name": "Cool Plum", "hex": "#663399", "hsl": "270 56% 40%"},
            ],
        },
        "neutral": {
            "name": "Neutral Tones",
            "description": "Blacks, whites, grays, and earth tones",
            "colors": [
                {"name": "Black", "hex": "#000000", "hsl": "0 0% 0%"},
                {"name": "Charcoal", "hex": "#36454F", "hsl": "200 13% 27%"},
                {"name": "White", "hex": "#FFFFFF", "hsl": "0 0% 100%"},
                {"name": "Cream", "hex": "#FFFDD0", "hsl": "60 100% 97%"},
                {"name": "Gray", "hex": "#808080", "hsl": "0 0% 50%"},
                {"name": "Taupe", "hex": "#B38B6D", "hsl": "20 24% 61%"},
                {"name": "Khaki", "hex": "#F0E68C", "hsl": "55 100% 80%"},
                {"name": "Ivory", "hex": "#FFFFF0", "hsl": "60 100% 97%"},
            ],
        },
        "vibrant": {
            "name": "Vibrant Tones",
            "description": "Bright and saturated colors",
            "colors": [
                {"name": "Bright Red", "hex": "#FF0000", "hsl": "0 100% 50%"},
                {"name": "Electric Blue", "hex": "#0080FF", "hsl": "210 100% 50%"},
                {"name": "Lime Green", "hex": "#00FF00", "hsl": "120 100% 50%"},
                {"name": "Hot Pink", "hex": "#FF1493", "hsl": "330 100% 50%"},
                {"name": "Bright Yellow", "hex": "#FFFF00", "hsl": "60 100% 50%"},
                {"name": "Magenta", "hex": "#FF00FF", "hsl": "300 100% 50%"},
                {"name": "Bright Cyan", "hex": "#00FFFF", "hsl": "180 100% 50%"},
                {"name": "Deep Purple", "hex": "#9932CC", "hsl": "280 72% 50%"},
            ],
        },
        "pastel": {
            "name": "Pastel Tones",
            "description": "Soft, muted colors",
            "colors": [
                {"name": "Blush Pink", "hex": "#FFB6C1", "hsl": "350 100% 83%"},
                {"name": "Pale Yellow", "hex": "#FFFFE0", "hsl": "60 100% 94%"},
                {"name": "Mint Green", "hex": "#98FF98", "hsl": "120 100% 80%"},
                {"name": "Lavender", "hex": "#E6E6FA", "hsl": "270 100% 96%"},
                {"name": "Peach", "hex": "#FFDAB9", "hsl": "30 100% 84%"},
                {"name": "Powder Blue", "hex": "#B0E0E6", "hsl": "180 69% 73%"},
                {"name": "Light Sage", "hex": "#C7E9C0", "hsl": "120 40% 84%"},
                {"name": "Mauve", "hex": "#E0B0FF", "hsl": "270 100% 88%"},
            ],
        },
    }

    # Seasonal color recommendations
    SEASONAL_PALETTES = {
        "spring": {
            "name": "Spring",
            "description": "Light, fresh, and delicate colors",
            "colors": ["Pastel Tones", "Vibrant Tones"],
            "key_colors": [
                {"name": "Soft Pink", "hsl": "0 100% 85%"},
                {"name": "Mint", "hsl": "120 61% 77%"},
                {"name": "Soft Yellow", "hsl": "60 100% 80%"},
            ],
        },
        "summer": {
            "name": "Summer",
            "description": "Bright, bold, and energetic colors",
            "colors": ["Vibrant Tones", "Cool Tones"],
            "key_colors": [
                {"name": "Coral", "hsl": "16 100% 70%"},
                {"name": "Bright Cyan", "hsl": "180 100% 50%"},
                {"name": "Lime", "hsl": "120 100% 50%"},
            ],
        },
        "autumn": {
            "name": "Autumn",
            "description": "Warm, earthy, and rich colors",
            "colors": ["Warm Tones", "Vibrant Tones"],
            "key_colors": [
                {"name": "Burnt Orange", "hsl": "12 100% 40%"},
                {"name": "Deep Brown", "hsl": "20 50% 30%"},
                {"name": "Mustard", "hsl": "45 93% 50%"},
            ],
        },
        "winter": {
            "name": "Winter",
            "description": "Cool, crisp, and contrasting colors",
            "colors": ["Cool Tones", "Neutral Tones"],
            "key_colors": [
                {"name": "Icy Blue", "hsl": "180 100% 50%"},
                {"name": "Deep Plum", "hsl": "270 56% 30%"},
                {"name": "Stark White", "hsl": "0 0% 100%"},
            ],
        },
    }

    @staticmethod
    def parse_hsl(hsl_string: str) -> Tuple[float, float, float]:
        """Parse HSL string like '30 45% 60%' to (h, s, l) tuple (0-360, 0-1, 0-1)"""
        try:
            parts = hsl_string.split()
            h = float(parts[0])
            s = float(parts[1].rstrip("%")) / 100
            l = float(parts[2].rstrip("%")) / 100
            return h, s, l
        except (ValueError, IndexError):
            return 0, 0, 0

    @staticmethod
    def hsl_to_string(h: float, s: float, l: float) -> str:
        """Convert HSL to string format '30 45% 60%'"""
        return f"{int(h)} {int(s * 100)}% {int(l * 100)}%"

    @staticmethod
    def get_complementary_color(hsl_string: str) -> Dict[str, str]:
        """Get complementary color (opposite on color wheel - 180°)"""
        h, s, l = ColorEngine.parse_hsl(hsl_string)
        comp_h = (h + 180) % 360
        return {
            "name": "Complementary",
            "hsl": ColorEngine.hsl_to_string(comp_h, s, l),
            "hex": ColorEngine.hsl_to_hex(comp_h, s, l),
            "type": "complementary",
        }

    @staticmethod
    def get_analogous_colors(hsl_string: str) -> List[Dict[str, str]]:
        """Get analogous colors (adjacent on color wheel ±30°)"""
        h, s, l = ColorEngine.parse_hsl(hsl_string)
        colors = []
        for offset in [-30, 30]:
            analog_h = (h + offset) % 360
            colors.append(
                {
                    "name": f"Analogous {'+' if offset > 0 else ''}{offset}°",
                    "hsl": ColorEngine.hsl_to_string(analog_h, s, l),
                    "hex": ColorEngine.hsl_to_hex(analog_h, s, l),
                    "type": "analogous",
                }
            )
        return colors

    @staticmethod
    def get_triadic_colors(hsl_string: str) -> List[Dict[str, str]]:
        """Get triadic colors (120° apart on color wheel)"""
        h, s, l = ColorEngine.parse_hsl(hsl_string)
        colors = []
        for offset in [120, 240]:
            triadic_h = (h + offset) % 360
            colors.append(
                {
                    "name": f"Triadic {offset}°",
                    "hsl": ColorEngine.hsl_to_string(triadic_h, s, l),
                    "hex": ColorEngine.hsl_to_hex(triadic_h, s, l),
                    "type": "triadic",
                }
            )
        return colors

    @staticmethod
    def hsl_to_hex(h: float, s: float, l: float) -> str:
        """Convert HSL to HEX color"""
        # Normalize H to 0-1 range for colorsys
        h_norm = h / 360
        # colorsys returns RGB in 0-1 range
        r, g, b = colorsys.hls_to_rgb(h_norm, l, s)
        # Convert to 0-255 and then to hex
        return f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"

    @classmethod
    def get_color_recommendations(cls, skin_tone_hsl: str) -> Dict:
        """
        Get comprehensive color recommendations based on skin tone

        Args:
            skin_tone_hsl: Skin tone in HSL format (e.g., "22 45% 65%")

        Returns:
            Dictionary with color recommendations
        """
        h, s, l = cls.parse_hsl(skin_tone_hsl)

        # Determine skin undertone (warm vs cool)
        is_warm = h < 60 or h > 300  # Warm hues: red, orange, yellow
        undertone = "warm" if is_warm else "cool"

        # Get recommended color palettes based on undertone
        if undertone == "warm":
            recommended_palette = "warm"
            complementary_palette = "cool"
        else:
            recommended_palette = "cool"
            complementary_palette = "warm"

        # Get primary recommendation colors
        primary_colors = cls.COLOR_PALETTES[recommended_palette]["colors"]
        secondary_colors = cls.COLOR_PALETTES[complementary_palette]["colors"]

        # Get color harmonies
        harmonies = {
            "complementary": cls.get_complementary_color(skin_tone_hsl),
            "analogous": cls.get_analogous_colors(skin_tone_hsl),
            "triadic": cls.get_triadic_colors(skin_tone_hsl),
        }

        return {
            "skin_tone_hsl": skin_tone_hsl,
            "undertone": undertone,
            "recommended_palette": {
                "name": cls.COLOR_PALETTES[recommended_palette]["name"],
                "description": cls.COLOR_PALETTES[recommended_palette]["description"],
                "colors": primary_colors[:4],  # Return top 4 colors
            },
            "complementary_palette": {
                "name": cls.COLOR_PALETTES[complementary_palette]["name"],
                "description": cls.COLOR_PALETTES[complementary_palette]["description"],
                "colors": secondary_colors[:4],
            },
            "color_harmonies": harmonies,
            "seasonal_recommendations": cls.get_seasonal_recommendations(undertone),
        }

    @classmethod
    def get_seasonal_recommendations(cls, undertone: str) -> Dict:
        """Get seasonal color recommendations based on undertone"""
        seasonal_recs = {}

        for season_key, season_data in cls.SEASONAL_PALETTES.items():
            # Prioritize seasons based on undertone
            is_primary = undertone == "warm" and season_key in ["autumn", "spring"]
            is_primary = undertone == "cool" and season_key in ["winter", "summer"] or is_primary

            seasonal_recs[season_key] = {
                "name": season_data["name"],
                "description": season_data["description"],
                "is_primary": is_primary,
                "key_colors": season_data["key_colors"],
            }

        return seasonal_recs

    @classmethod
    def get_color_match_score(
        cls, garment_color: str, skin_tone_hsl: str, harmony_type: str = "analogous"
    ) -> float:
        """
        Calculate how well a garment color matches the user's skin tone

        Args:
            garment_color: Garment color in HSL format
            skin_tone_hsl: Skin tone in HSL format
            harmony_type: Type of harmony to match (complementary, analogous, triadic)

        Returns:
            Score from 0-100 representing color match quality
        """
        h_garment, s_garment, l_garment = cls.parse_hsl(garment_color)
        h_skin, s_skin, l_skin = cls.parse_hsl(skin_tone_hsl)

        hue_diff = min(abs(h_garment - h_skin), 360 - abs(h_garment - h_skin))
        saturation_diff = abs(s_garment - s_skin)
        lightness_diff = abs(l_garment - l_skin)

        # Calculate score based on harmony type
        if harmony_type == "complementary":
            target_hue_diff = 180
            hue_score = max(0, 100 - abs(hue_diff - target_hue_diff) * 0.2)
        elif harmony_type == "triadic":
            target_hue_diffs = [120, 240]
            hue_score = max(0, max([100 - abs(hue_diff - target) * 0.2 for target in target_hue_diffs]))
        else:  # analogous
            target_hue_diff = 30
            hue_score = max(0, 100 - abs(hue_diff - target_hue_diff) * 0.5)

        # Weight factors: hue is most important, followed by saturation, then lightness
        saturation_score = max(0, 100 - saturation_diff * 200)
        lightness_score = max(0, 100 - lightness_diff * 100)

        # Combined score
        final_score = (hue_score * 0.6 + saturation_score * 0.2 + lightness_score * 0.2)

        return max(0, min(100, final_score))

    @classmethod
    def suggest_garment_colors(cls, skin_tone_hsl: str, limit: int = 5) -> List[Dict]:
        """
        Suggest the best colors for garments based on skin tone

        Args:
            skin_tone_hsl: Skin tone in HSL format
            limit: Maximum number of color suggestions

        Returns:
            List of suggested colors sorted by match score
        """
        recommendations = cls.get_color_recommendations(skin_tone_hsl)
        suggested_colors = []

        # Flatten all recommended colors
        all_colors = (
            recommendations["recommended_palette"]["colors"]
            + recommendations["complementary_palette"]["colors"]
        )

        # Score each color
        for color in all_colors:
            score = cls.get_color_match_score(color["hsl"], skin_tone_hsl)
            suggested_colors.append({**color, "match_score": score})

        # Sort by score and return top N
        suggested_colors.sort(key=lambda x: x["match_score"], reverse=True)
        return suggested_colors[:limit]
