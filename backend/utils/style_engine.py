"""
Style Recommendation Engine
Suggests fashion styles based on body type, skin tone, and personal preferences
"""

from typing import List, Dict, Tuple
from enum import Enum


class BodyTypeStyle(Enum):
    """Body type style compatibility"""

    SLIM = "slim"
    AVERAGE = "average"
    ATHLETIC = "athletic"
    MUSCULAR = "muscular"
    CURVY = "curvy"
    PLUSSIZE = "plus-size"
    PETITE = "petite"
    TALL = "tall"


class StyleEngine:
    """
    Provides style recommendations based on body type, skin tone, and fashion principles
    """

    # Style categories with characteristics
    STYLE_CATEGORIES = {
        "casual": {
            "name": "Casual",
            "description": "Comfortable, relaxed, and everyday wear",
            "characteristics": ["relaxed-fit", "comfortable", "easy-care", "versatile"],
            "recommended_items": ["t-shirts", "jeans", "sneakers", "hoodies", "shorts"],
            "occasions": ["daily", "weekend", "outdoor", "social"],
            "formality_level": 1,
        },
        "smart-casual": {
            "name": "Smart Casual",
            "description": "Versatile blend of casual and professional",
            "characteristics": ["well-fitted", "polished", "accessorized", "put-together"],
            "recommended_items": ["blouses", "chinos", "loafers", "cardigans", "blazers"],
            "occasions": ["work", "brunch", "casual dates", "dinner"],
            "formality_level": 2,
        },
        "professional": {
            "name": "Professional",
            "description": "Business and formal work attire",
            "characteristics": ["tailored", "structured", "neutral", "sophisticated"],
            "recommended_items": ["blazers", "dress-pants", "office-dresses", "heels"],
            "occasions": ["work", "meetings", "interviews", "business-events"],
            "formality_level": 3,
        },
        "formal": {
            "name": "Formal",
            "description": "Evening wear and special occasions",
            "characteristics": ["elegant", "refined", "glamorous", "statement-pieces"],
            "recommended_items": ["evening-dresses", "tuxedos", "formal-attire"],
            "occasions": ["wedding", "gala", "dinner-parties", "red-carpet"],
            "formality_level": 4,
        },
        "athletic": {
            "name": "Athletic",
            "description": "Sports and workout wear",
            "characteristics": ["performance-fabric", "moisture-wicking", "supportive"],
            "recommended_items": ["leggings", "sports-bras", "athletic-shoes", "tanks"],
            "occasions": ["gym", "yoga", "running", "sports"],
            "formality_level": 0,
        },
        "bohemian": {
            "name": "Bohemian",
            "description": "Free-spirited and artistic style",
            "characteristics": ["flowy", "patterned", "textured", "eclectic"],
            "recommended_items": ["maxi-dresses", "wrap-tops", "flowy-pants", "sandals"],
            "occasions": ["festival", "casual-outings", "beach", "creative"],
            "formality_level": 1,
        },
        "minimalist": {
            "name": "Minimalist",
            "description": "Simple, clean, and timeless pieces",
            "characteristics": ["neutral-colors", "minimal-pattern", "quality-fabric"],
            "recommended_items": ["basic-tees", "neutral-trousers", "button-ups"],
            "occasions": ["everyday", "minimalist-lifestyle"],
            "formality_level": 2,
        },
        "vintage": {
            "name": "Vintage",
            "description": "Retro and timeless style inspired by past eras",
            "characteristics": ["classic-cuts", "timeless", "nostalgic", "curated"],
            "recommended_items": ["vintage-dresses", "high-waisted-jeans", "retro-shoes"],
            "occasions": ["everyday", "special-events", "themed-parties"],
            "formality_level": 2,
        },
        "chic": {
            "name": "Chic",
            "description": "Sophisticated and stylish fashion-forward approach",
            "characteristics": ["tailored", "current-trends", "quality-pieces"],
            "recommended_items": ["fitted-blazers", "elegant-dresses", "designer-pieces"],
            "occasions": ["social", "shopping", "brunches", "events"],
            "formality_level": 3,
        },
        "edgy": {
            "name": "Edgy",
            "description": "Bold, daring, and statement-making style",
            "characteristics": ["dark-colors", "leather", "metallic", "bold-accessories"],
            "recommended_items": ["leather-jackets", "dark-jeans", "boots", "band-tees"],
            "occasions": ["night-out", "concerts", "creative-events"],
            "formality_level": 1,
        },
    }

    # Body type style recommendations
    BODY_TYPE_STYLE_FITS = {
        "slim": {
            "primary": ["casual", "minimalist", "chic"],
            "advice": "Focus on structured pieces to add dimension",
            "flattering_fits": ["fitted", "layered", "monochromatic"],
            "avoid": ["oversized", "horizontal-stripes"],
            "key_pieces": ["fitted-tops", "cropped-jackets", "straight-leg-jeans"],
        },
        "average": {
            "primary": ["smart-casual", "professional", "casual"],
            "advice": "Balance is key - mix fitted and relaxed pieces",
            "flattering_fits": ["fitted-waist", "balanced-proportions"],
            "avoid": ["too-tight", "too-loose"],
            "key_pieces": ["fitted-dresses", "well-fitted-jeans", "belted-pieces"],
        },
        "athletic": {
            "primary": ["athletic", "casual", "smart-casual"],
            "advice": "Showcase your physique with tailored pieces",
            "flattering_fits": ["fitted", "structured"],
            "avoid": ["baggy", "oversized"],
            "key_pieces": ["fitted-tees", "sports-bras", "structured-pants"],
        },
        "muscular": {
            "primary": ["athletic", "casual", "edgy"],
            "advice": "Choose pieces that allow movement and show definition",
            "flattering_fits": ["fitted-through-shoulders", "tapered"],
            "avoid": ["tight-armpits", "restrictive"],
            "key_pieces": ["fitted-tees", "tapered-pants", "structured-jackets"],
        },
        "curvy": {
            "primary": ["smart-casual", "chic", "bohemian"],
            "advice": "Emphasize curves with strategic cuts and belts",
            "flattering_fits": ["peplum", "wrap-styles", "belted"],
            "avoid": ["overly-tight", "shapeless"],
            "key_pieces": ["wrap-dresses", "peplum-tops", "wide-leg-pants"],
        },
        "plus-size": {
            "primary": ["smart-casual", "professional", "casual"],
            "advice": "Focus on well-fitting pieces and strategic layering",
            "flattering_fits": ["structured", "belted", "layered"],
            "avoid": ["too-tight", "shapeless", "clingy"],
            "key_pieces": ["structured-blazers", "fit-and-flare-dresses", "bootcut-jeans"],
        },
        "petite": {
            "primary": ["minimalist", "chic", "casual"],
            "advice": "Vertical lines and crop lengths to elongate",
            "flattering_fits": ["cropped", "vertical-patterns", "fitted"],
            "avoid": ["oversized", "horizontal-stripes"],
            "key_pieces": ["cropped-tops", "petite-length-pants", "monochromatic"],
        },
        "tall": {
            "primary": ["bohemian", "professional", "chic"],
            "advice": "Embrace length with maxi-styles and horizontal elements",
            "flattering_fits": ["maxi", "oversized", "horizontal-stripes"],
            "avoid": ["too-cropped", "shapeless"],
            "key_pieces": ["maxi-skirts", "long-dresses", "horizontal-striped-tops"],
        },
    }

    @staticmethod
    def get_style_recommendations_for_body_type(body_type: str) -> Dict:
        """
        Get style recommendations for a specific body type

        Args:
            body_type: Body type (slim, average, athletic, etc.)

        Returns:
            Dictionary with style recommendations
        """
        body_type_lower = body_type.lower()
        style_advice = StyleEngine.BODY_TYPE_STYLE_FITS.get(
            body_type_lower,
            StyleEngine.BODY_TYPE_STYLE_FITS.get("average"),  # Default to average
        )

        primary_styles = []
        for style_id in style_advice["primary"]:
            if style_id in StyleEngine.STYLE_CATEGORIES:
                style = StyleEngine.STYLE_CATEGORIES[style_id]
                primary_styles.append({**style, "id": style_id})

        return {
            "body_type": body_type,
            "general_advice": style_advice["advice"],
            "recommended_styles": primary_styles,
            "flattering_fits": style_advice["flattering_fits"],
            "avoid": style_advice["avoid"],
            "key_pieces": style_advice["key_pieces"],
        }

    @staticmethod
    def get_style_combinations(style1: str, style2: str) -> Dict:
        """
        Get recommendations for combining two styles

        Args:
            style1: First style category
            style2: Second style category

        Returns:
            Dictionary with combination advice
        """
        s1 = StyleEngine.STYLE_CATEGORIES.get(style1)
        s2 = StyleEngine.STYLE_CATEGORIES.get(style2)

        if not s1 or not s2:
            return {"error": "Invalid style category"}

        # Calculate formality compatibility
        formality_diff = abs(s1["formality_level"] - s2["formality_level"])
        compatibility = "excellent" if formality_diff <= 1 else "moderate" if formality_diff <= 2 else "challenging"

        return {
            "style_1": s1["name"],
            "style_2": s2["name"],
            "compatibility": compatibility,
            "tips": [
                f"Balance {s1['name'].lower()} with {s2['name'].lower()} pieces",
                f"Use {s1['name'].lower()} items as base and {s2['name'].lower()} for accents",
                "Choose a neutral color palette to bridge the two styles",
                f"Accessorize to tie the {s1['name'].lower()} and {s2['name'].lower()} looks together",
            ],
        }

    @staticmethod
    def get_occasion_style_recommendations(occasion: str) -> Dict:
        """
        Get style recommendations for a specific occasion

        Args:
            occasion: Type of occasion (work, casual, formal, etc.)

        Returns:
            Dictionary with occasion-specific style recommendations
        """
        occasion_lower = occasion.lower()

        # Map occasions to appropriate styles
        occasion_style_map = {
            "work": ["professional", "smart-casual", "minimalist"],
            "date": ["smart-casual", "chic", "casual"],
            "casual": ["casual", "bohemian", "minimalist"],
            "formal": ["formal", "professional", "chic"],
            "gym": ["athletic", "casual"],
            "party": ["formal", "chic", "edgy"],
            "beach": ["bohemian", "casual", "athletic"],
            "nightout": ["chic", "edgy", "formal"],
            "brunch": ["smart-casual", "chic", "casual"],
            "festival": ["bohemian", "casual", "edgy"],
        }

        recommended_style_ids = occasion_style_map.get(occasion_lower, ["smart-casual", "casual"])

        recommended_styles = []
        for style_id in recommended_style_ids:
            if style_id in StyleEngine.STYLE_CATEGORIES:
                style = StyleEngine.STYLE_CATEGORIES[style_id]
                recommended_styles.append({**style, "id": style_id})

        return {
            "occasion": occasion,
            "recommended_styles": recommended_styles,
            "tips": [
                f"Choose pieces appropriate for {occasion.lower()}",
                "Match your style to the venue and dress code",
                "Comfort is important - pick styles you feel confident in",
                "Consider the weather and season when selecting pieces",
            ],
        }

    @staticmethod
    def get_detailed_style_profile(body_type: str, occasion: str = None) -> Dict:
        """
        Get a detailed style profile combining body type and occasion

        Args:
            body_type: User's body type
            occasion: Optional occasion type

        Returns:
            Comprehensive style profile
        """
        body_style = StyleEngine.get_style_recommendations_for_body_type(body_type)

        profile = {
            "body_type_profile": body_style,
        }

        if occasion:
            occasion_style = StyleEngine.get_occasion_style_recommendations(occasion)
            profile["occasion_profile"] = occasion_style

            # Find overlapping recommended styles
            body_style_ids = set(s["id"] for s in body_style["recommended_styles"])
            occasion_style_ids = set(s["id"] for s in occasion_style["recommended_styles"])
            overlapping = body_style_ids.intersection(occasion_style_ids)

            if overlapping:
                profile["best_fit_styles"] = [
                    StyleEngine.STYLE_CATEGORIES[style_id] for style_id in overlapping
                ]
            else:
                profile["best_fit_styles"] = body_style["recommended_styles"][:2]

        return profile

    @staticmethod
    def get_style_match_score(
        garment_style_tags: List[str], recommended_styles: List[str], body_type: str = None
    ) -> float:
        """
        Calculate how well a garment matches recommended styles

        Args:
            garment_style_tags: Tags/categories a garment belongs to
            recommended_styles: List of recommended style IDs
            body_type: Optional body type for additional scoring

        Returns:
            Score from 0-100 representing style match quality
        """
        matches = sum(1 for tag in garment_style_tags if tag in recommended_styles)
        base_score = (matches / max(len(recommended_styles), 1)) * 100

        # Add bonus for flattering characteristics if body type is provided
        if body_type:
            body_advice = StyleEngine.BODY_TYPE_STYLE_FITS.get(body_type.lower())
            if body_advice:
                for tag in garment_style_tags:
                    if tag in body_advice.get("flattering_fits", []):
                        base_score += 10
                    elif tag in body_advice.get("avoid", []):
                        base_score -= 15

        return max(0, min(100, base_score))
