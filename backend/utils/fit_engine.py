from typing import Dict, List, Tuple
import json
import os
import google.generativeai as genai

class FitEngine:
    """
    Predicts garment fit based on user measurements and garment specifications.
    Generates fit scores and recommendations, potentially using Gemini AI.
    """
    
    def __init__(self):
        # Initialize Gemini API if key is available
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.use_gemini = False
        if self.gemini_key:
            try:
                genai.configure(api_key=self.gemini_key)
                self.model = genai.GenerativeModel('gemini-pro')
                self.use_gemini = True
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")
                
    def predict_fit(self, user_measurements: Dict, garment: Dict, user_size: str) -> Dict:
        """
        Predict how well a garment will fit.
        
        Args:
            user_measurements: User's body measurements
            garment: Garment specs from database
            user_size: Selected size (XS, S, M, L, XL)
            
        Returns:
            Dict with fit prediction, score, issues, and recommendations
        """
        
        # Get garment specs for selected size
        if user_size not in garment['specifications']['sizes']:
            return {'error': 'Size not available'}
        
        garment_size = garment['specifications']['sizes'][user_size]
        stretch_percentage = garment.get('stretch_percentage', 5)
        
        # Gender mismatch penalty
        user_gender = user_measurements.get('gender', 'other')
        garment_target_gender = garment.get('target_gender', 'unisex')
        
        gender_penalty = 0
        is_gender_mismatch = False
        
        if garment_target_gender != 'unisex' and user_gender not in ['other', '']:
            if garment_target_gender != user_gender:
                is_gender_mismatch = True
                # Severe penalty for wearing unmatching gender cuts (unless intended)
                gender_penalty = 40
        
        # Calculate fit metrics
        length_fit = self._check_length_fit(user_measurements, garment_size, garment['category'])
        width_fit = self._check_width_fit(user_measurements, garment_size, garment['category'], stretch_percentage)
        proportional_fit = self._check_proportional_fit(user_measurements, garment, user_size)
        
        # Overall fit score (0-100)
        overall_score = self._calculate_overall_score(length_fit, width_fit, proportional_fit)
        
        # Apply gender mismatch penalty
        if gender_penalty > 0:
            overall_score = max(0, overall_score - gender_penalty)
            # Cap maximum score at 45 (POOR fit range)
            overall_score = min(45, overall_score)
        
        # Identify issues
        issues = self._identify_issues(length_fit, width_fit, proportional_fit, garment)
        
        # Add gender mismatch to issues
        if is_gender_mismatch:
            issues.insert(0, f"⚠️ GENDER CUT MISMATCH: This is a {garment_target_gender}'s garment, but your profile matches {user_gender} proportions. The shoulders, chest/bust, and hip shapes will likely not fit properly.")
        
        # Generate recommendations
        recommendations = self._generate_recommendations(overall_score, issues, garment)
        
        # Optionally enhance recommendations using Gemini AI
        ai_advice = None
        if self.use_gemini:
            try:
                ai_advice = self._get_gemini_advice(
                    user_measurements, garment, user_size, overall_score, issues, is_gender_mismatch
                )
            except Exception as e:
                print(f"Gemini generation failed: {e}")
        
        return {
            'garment_id': garment['id'],
            'garment_name': garment['name'],
            'selected_size': user_size,
            'overall_fit_score': overall_score,
            'fit_breakdown': {
                'length': length_fit * 100,
                'width': width_fit * 100,
                'proportional': proportional_fit * 100
            },
            'fit_quality': self._score_to_quality(overall_score),
            'issues': issues,
            'recommendations': recommendations,
            'ai_advice': ai_advice,
            'stretch_accommodation': garment['stretch_percentage']
        }
    
    def _get_gemini_advice(self, user, garment, size, score, issues, is_gender_mismatch) -> str:
        """Call Gemini to get a customized styling advice paragraph."""
        prompt = f"""
        Act as a professional fashion stylist and virtual fitting expert.
        The user has a '{user.get('body_type', 'average')}' body type and identifies as {user.get('gender', 'unknown')}.
        They measure {user.get('height', 165):.1f}cm tall with a {user.get('bust', 0):.1f}cm chest/bust, {user.get('waist', 0):.1f}cm waist, and {user.get('hips', 0):.1f}cm hips.
        
        They are trying on a: {garment.get('name', 'Garment')} (Size {size}), which is designed for {garment.get('target_gender', 'unisex')}s.
        The calculated fit score is {score}/100.
        Identified fit issues: {', '.join(issues) if issues else 'None'}
        Gender design mismatch: {is_gender_mismatch}
        
        Write a SHORT (2-3 sentences max) personalized styling advice.
        If there is a gender mismatch, gently explain that the cut (shoulders/chest/hips) might not drape correctly on their proportions, but they can still rock it if they prefer that style.
        If the score is low, explain why and suggest what kind of fit to look for. If high, hype them up.
        Keep the tone polite, modern, and helpful. Do not use markdown bullet points.
        """
        
        response = self.model.generate_content(prompt)
        return response.text.replace('\n', ' ').strip()
        
    def _check_length_fit(self, measurements: Dict, garment_size: Dict, category: str) -> float:
        """
        Check if length fits well.
        Returns score 0-1 (0=too short, 0.5=perfect, 1=too long)
        Accounts for measurement variability and category-specific standards.
        """
        
        # Length key varies by category
        if category in ['tops', 'outerwear']:
            user_length_key = 'length'  # Torso length proxy
            garment_length_key = 'length'
            tolerance = 3  # cm - more flexible for tops
        elif category == 'bottoms':
            user_length_key = 'inseam'
            garment_length_key = 'inseam'
            tolerance = 2  # cm - stricter for bottoms
        elif category == 'dresses':
            user_length_key = 'length'  # Full body height estimation
            garment_length_key = 'length'
            tolerance = 5  # cm - more flexible for dresses
        else:
            return 0.5  # Neutral if can't determine
        
        user_len = measurements.get(user_length_key, 0)
        garment_len = garment_size.get(garment_length_key, 0)
        
        if user_len == 0 or garment_len == 0:
            return 0.5  # Return neutral if missing measurement
        
        # Calculate difference (positive = garment is too long, negative = garment is too short)
        diff = garment_len - user_len
        
        abs_diff = abs(diff)
        
        # Scoring with directional logic
        if abs_diff <= tolerance / 2:
            return 0.5  # Perfect fit (within tight tolerance)
        elif abs_diff <= tolerance:
            adjustment = (abs_diff / tolerance) * 0.15
            return 0.5 + (adjustment if diff > 0 else -adjustment)
        elif abs_diff <= tolerance * 2:
            base = 0.65 if diff > 0 else 0.35
            adjustment = (abs_diff / (tolerance * 2)) * 0.15
            return base + (adjustment if diff > 0 else -adjustment)
        else:
            # Significantly off
            excess = abs_diff - (tolerance * 2)
            if diff > 0:
                return min(0.95, 0.8 + (excess / 20) * 0.15)
            else:
                return max(0.05, 0.2 - (excess / 20) * 0.15)
    
    def _check_width_fit(self, measurements: Dict, garment_size: Dict, category: str, stretch_percent: float = 5) -> float:
        """
        Check if width/circumference fits.
        Returns score 0-1 (0=too tight, 0.5=perfect, 1=too loose)
        Accounts for stretch percentage and measurement variability.
        """
        
        # Width key varies by category
        if category in ['tops', 'outerwear']:
            user_width_key = 'bust'
            garment_width_key = 'chest_width'
            tolerance = 3  # cm
            ease_allowance = 4.0  # target ease for perfect fit
        elif category == 'bottoms':
            user_width_key = 'waist'
            garment_width_key = 'waist'
            tolerance = 2.5  # cm - tighter tolerance for bottoms
            ease_allowance = 1.5  # tighter fit expected
        elif category == 'dresses':
            user_width_key = 'bust'
            garment_width_key = 'bust'
            tolerance = 3  # cm
            ease_allowance = 3.0  # standard ease
        else:
            return 0.5
        
        user_width = measurements.get(user_width_key, 0)
        garment_width_flat = garment_size.get(garment_width_key, 0)
        
        # Garment width is almost always a flat measurement (e.g. 40cm across the chest),
        # so we MUST multiply by 2 to compare with a full body circumference like bust/waist.
        garment_width = garment_width_flat * 2 if garment_width_flat > 0 else 0
        
        if user_width == 0 or garment_width == 0:
            return 0.5
        
        # Calculate diff minus standard ease (positive = still looser than perfect, negative = too tight)
        diff = garment_width - (user_width + ease_allowance)
        
        # Adjust tolerance based on stretch percentage
        # Higher stretch = more tolerance for being too tight
        stretch_adjusted_tolerance = tolerance * (1 + stretch_percent / 100)
        
        # Scoring with asymmetric penalties (being too tight is worse than too loose)
        if abs(diff) <= tolerance / 2:
            return 0.5  # Perfect fit
        elif diff > 0 and diff <= stretch_adjusted_tolerance:
            # Too loose (but acceptable with stretch or styling)
            return 0.5 + (diff / stretch_adjusted_tolerance) * 0.25
        elif diff < 0 and abs(diff) <= tolerance:
            # Too tight but within acceptable range
            penalty = abs(diff) / tolerance * 0.25
            return 0.5 - penalty
        elif diff < 0 and abs(diff) <= stretch_adjusted_tolerance:
            # Too tight but stretch can help
            penalty = abs(diff) / stretch_adjusted_tolerance * 0.30
            return max(0.2, 0.5 - penalty)
        else:
            # Significantly mismatched
            if diff > 0:
                # Too loose - not ideal but visible
                excess = diff - stretch_adjusted_tolerance
                return min(0.85, 0.7 + (excess / 15) * 0.1)
            else:
                # Too tight - problematic
                excess = abs(diff) - stretch_adjusted_tolerance
                return max(0.1, 0.2 - (excess / 10) * 0.05)
    
    def _check_proportional_fit(self, measurements: Dict, garment: Dict, user_size: str) -> float:
        """
        Check if body type and proportions match garment design.
        Considers body type, silhouette compatibility, and target audience.
        """
        
        user_body_type = measurements.get('body_type', 'average')
        target_types = garment.get('target_body_types', ['average'])
        fit_notes = garment.get('fit_notes', '')
        
        # Direct match with target types
        if user_body_type in target_types:
            base_score = 0.75
        # Check similarity
        elif self._is_similar_body_type(user_body_type, target_types):
            base_score = 0.65
        else:
            base_score = 0.45
        
        # Adjust based on garment silhouette fitting notes
        if fit_notes:
            fit_notes_lower = fit_notes.lower()
            
            # Fitted styles suit athletic/slim body types
            if 'fitted' in fit_notes_lower and user_body_type in ['athletic', 'slim']:
                base_score += 0.1
            elif 'fitted' in fit_notes_lower and user_body_type in ['curvy', 'plus-size']:
                base_score -= 0.1
                
            # A-line/flowing styles suit pear/hourglass/curvy
            if any(style in fit_notes_lower for style in ['a-line', 'flowing', 'loose']):
                if user_body_type in ['pear', 'hourglass', 'curvy']:
                    base_score += 0.1
                    
            # Structured styles suit athletic/tall
            if 'structured' in fit_notes_lower and user_body_type in ['athletic', 'tall']:
                base_score += 0.1
        
        return min(1.0, max(0.3, base_score))
    
    def recommend_sizes(self, user_measurements: Dict, garment: Dict) -> Dict:
        """
        Evaluate all available sizes and recommend the best fitting option.
        
        Args:
            user_measurements: User's body measurements
            garment: Garment specs from database
            
        Returns:
            Dict with size recommendations ranked by fit score
        """
        size_scores = {}
        
        # Evaluate each available size
        for size, garment_size in garment['specifications']['sizes'].items():
            length_fit = self._check_length_fit(user_measurements, garment_size, garment['category'])
            width_fit = self._check_width_fit(
                user_measurements, 
                garment_size, 
                garment['category'],
                garment.get('stretch_percentage', 5)
            )
            proportional_fit = self._check_proportional_fit(user_measurements, garment, size)
            
            score = self._calculate_overall_score(length_fit, width_fit, proportional_fit)
            size_scores[size] = {
                'score': score,
                'length_fit': length_fit,
                'width_fit': width_fit,
                'proportional_fit': proportional_fit
            }
        
        # Sort sizes by score descending
        sorted_sizes = sorted(size_scores.items(), key=lambda x: x[1]['score'], reverse=True)
        
        # Format recommendations
        recommendations = {
            'all_sizes': size_scores,
            'best_fit': sorted_sizes[0][0] if sorted_sizes else None,
            'ranked_sizes': [
                {
                    'size': size,
                    'score': data['score'],
                    'rating': self._score_to_quality(data['score']),
                    'recommendation': self._size_score_to_action(data['score'])
                }
                for size, data in sorted_sizes
            ]
        }
        
        return recommendations
    
    def _size_score_to_action(self, score: int) -> str:
        """Convert size score to action recommendation."""
        if score >= 85:
            return "EXCELLENT"
        elif score >= 75:
            return "GOOD"
        elif score >= 60:
            return "ACCEPTABLE"
        elif score >= 45:
            return "TRY_CAUTION"
        else:
            return "POOR"
    
    def _is_similar_body_type(self, user_type: str, target_types: List[str]) -> bool:
        """Check if user's body type is similar to target types."""
        
        # Define similar body types
        similar_groups = [
            ['slim', 'average', 'athletic'],
            ['curvy', 'average'],
            ['plus-size', 'curvy'],
            ['petite', 'average', 'slim'],
            ['tall', 'athletic', 'average']
        ]
        
        for group in similar_groups:
            if user_type in group and any(t in group for t in target_types):
                return True
        
        return False
    
    def _calculate_overall_score(self, length: float, width: float, proportional: float) -> int:
        """
        Calculate overall fit score (0-100).
        Width is most critical (45%), length (35%), proportional fit (20%).
        Uses non-linear scaling to be more discriminating at high scores.
        """
        
        # Weighted average: width (45%), length (35%), proportional (20%)
        raw_score = (width * 0.45 + length * 0.35 + proportional * 0.20)
        
        # Apply sigmoid-like scaling to be more discriminating at high confidence levels
        # This makes excellent fits (0.8+) harder to reach
        if raw_score >= 0.75:
            # Map 0.75-1.0 to 75-95 (not quite 100 even at perfect fit)
            adjusted = 75 + (raw_score - 0.75) / 0.25 * 20
        elif raw_score >= 0.5:
            # Map 0.5-0.75 to 50-75
            adjusted = 50 + (raw_score - 0.5) / 0.25 * 25
        else:
            # Map 0-0.5 to 0-50
            adjusted = raw_score / 0.5 * 50
        
        return min(100, max(0, int(adjusted)))
    
    def _score_to_quality(self, score: int) -> str:
        """Convert score to quality descriptor."""
        
        if score >= 80:
            return "Excellent fit"
        elif score >= 65:
            return "Good fit"
        elif score >= 50:
            return "Acceptable fit"
        elif score >= 35:
            return "Poor fit"
        else:
            return "Not recommended"
    
    def _identify_issues(self, length_fit: float, width_fit: float, proportional_fit: float, garment: Dict) -> List[str]:
        """Identify specific fit issues with actionable guidance."""
        
        issues = []
        
        # Length issues (more specific thresholds)
        if length_fit < 0.25:
            issues.append("❌ Significantly too short - may expose midriff")
        elif length_fit < 0.35:
            issues.append("⚠️ Too short - hem adjustment recommended")
        elif length_fit > 0.8:
            issues.append("❌ Significantly too long - will drag or bunch")
        elif length_fit > 0.7:
            issues.append("⚠️ Slightly long - may need tailoring")
        
        # Width issues (asymmetric: tightness is worse than looseness)
        if width_fit < 0.15:
            issues.append("❌ Far too tight - restrict movement, uncomfortable wear")
        elif width_fit < 0.3:
            issues.append("⚠️ Too tight - may feel restrictive")
        elif width_fit < 0.4:
            issues.append("⚠️ Snug fit - check stretch percentage for comfort")
        elif width_fit > 0.8:
            issues.append("⚠️ Quite loose - consider size down for better silhouette")
        elif width_fit > 0.7:
            issues.append("💡 Slightly loose - depends on desired fit style")
        
        # Proportional issues
        if proportional_fit < 0.35:
            issues.append("⚠️ May not suit your body proportions - consider another style")
        elif proportional_fit < 0.5:
            issues.append("💡 Not ideal for your body type - worth trying anyway")
        
        return issues if issues else ["✅ No major fit issues identified"]
    
    def _generate_recommendations(self, score: int, issues: List[str], garment: Dict) -> Dict:
        """
        Generate actionable recommendations based on fit score and issues.
        Includes size change suggestions and confidence levels.
        """
        
        recommendations = {
            'should_buy': score >= 70,
            'confidence': self._calculate_confidence(score, issues),
            'suggestions': [],
            'action': self._get_action_label(score)
        }
        
        # Check for specific issues and provide targeted suggestions
        issues_text = ' '.join(issues).lower()
        stretch = garment.get('stretch_percentage', 5)
        
        # Tightness issues
        if 'too tight' in issues_text or 'far too tight' in issues_text:
            # Check if this is already the largest available size
            available_sizes = list(garment.get('specifications', {}).get('sizes', {}).keys())
            is_max_size = self._is_maximum_size(available_sizes)
            
            if is_max_size:
                # Already at max size - don't recommend sizing up
                recommendations['suggestions'].append(f"❌ This garment is too tight even in the largest size available ({available_sizes[-1]})")
                recommendations['suggestions'].append(f"💡 Consider a different garment style - this cut may not suit your measurements")
                recommendations['action'] = 'RECONSIDER'  # Override action to be more honest
            else:
                recommendations['suggestions'].append(f"📏 Try size UP - current fit is too tight")
                if stretch > 10:
                    recommendations['suggestions'].append(f"💪 Good news: {stretch:.0f}% stretch will help - still may feel snug")
        
        # Snug fit
        elif 'snug' in issues_text:
            recommendations['suggestions'].append(f"🔄 Stretch: {stretch:.0f}% - verify comfort when trying on")
            if stretch < 5:
                recommendations['suggestions'].append("Consider sizing up if you prefer looser fit")
        
        # Length issues
        if 'too short' in issues_text or 'too long' in issues_text:
            if 'short' in issues_text:
                recommendations['suggestions'].append("📏 Consider size UP or try a longer style variant")
            else:
                recommendations['suggestions'].append("✂️ Can be tailored shorter or layered differently")
        
        # Loose fit
        if 'loose' in issues_text and 'slightly' in issues_text:
            recommendations['suggestions'].append("👕 Loose fit - great for relaxed silhouette or layering")
        elif 'quite loose' in issues_text:
            recommendations['suggestions'].append("📏 Consider size DOWN for more fitted silhouette")
        
        # Proportional fit notes
        if 'may not suit' in issues_text:
            original_fit_notes = garment.get('fit_notes', 'this style')
            recommendations['suggestions'].append(f"💡 This style flatters {original_fit_notes} body types most - still worth trying")
        
        # Default positive recommendation only for decent fits
        if not recommendations['suggestions'] and score >= 60:
            recommendations['suggestions'].insert(0, "✨ Good fit! Recommended for your measurements")
        elif not recommendations['suggestions'] and score < 40:
            recommendations['suggestions'].insert(0, f"⚠️ Poor fit (score {score}/100). Consider other options or sizes.")
        
        return recommendations
    
    def _is_maximum_size(self, sizes_list: list) -> bool:
        """Check if we're likely at the maximum available size."""
        # Size progression: XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL, ...
        # or numeric: 24-36 for pants
        size_order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']
        
        if not sizes_list:
            return False
        
        last_size = sizes_list[-1]
        
        # Check if last size is in our known maximum sizes
        return last_size in ['5XL', '4XL', '3XL'] or (last_size.isdigit() and int(last_size) >= 48)
    
    def _calculate_confidence(self, score: int, issues: List[str]) -> int:
        """Calculate confidence level (0-100) based on score and issue severity."""
        
        # Start with score as base
        confidence = score
        
        # Reduce for critical issues
        critical_issues = [issue for issue in issues if '❌' in issue]
        confidence -= len(critical_issues) * 8
        
        # Slight reduction for warnings
        warning_issues = [issue for issue in issues if '⚠️' in issue]
        confidence -= len(warning_issues) * 3
        
        # Cap at 95 for real-world uncertainty
        return min(95, max(10, confidence))
    
    def _get_action_label(self, score: int) -> str:
        """Get user-friendly action label based on score."""
        
        if score >= 85:
            return "BUY_NOW"
        elif score >= 75:
            return "RECOMMENDED"
        elif score >= 60:
            return "MIGHT_WORK"
        elif score >= 40:
            return "TRY_CAUTION"
        else:
            return "RECONSIDER"
    
    # ============================================================================
    # NEW INTELLIGENCE LAYER - Phase 1 Enhancement
    # These methods add natural language explanations and comfort metrics
    # Fully backward compatible - fit_engine continues to work as before
    # ============================================================================
    
    def generate_fit_explanation(self, fit_result: Dict) -> str:
        """
        Generate natural language explanation from existing fit data.
        
        Args:
            fit_result: Dict with fit prediction results
        
        Returns:
            String with 2-3 sentence explanation of fit
        """
        score = fit_result.get('overall_fit_score', 50)
        issues = fit_result.get('issues', [])
        garment_name = fit_result.get('garment_name', 'This garment')
        
        # Base explanation based on score
        if score >= 85:
            base = f"Excellent fit! {garment_name} is well-suited for you."
        elif score >= 75:
            base = f"Good fit. {garment_name} works well for your measurements."
        elif score >= 65:
            base = f"Acceptable fit. {garment_name} fits reasonably well overall."
        elif score >= 50:
            base = f"Moderate fit. {garment_name} has some considerations to note."
        else:
            base = f"{garment_name} may not be ideal for your fit profile."
        
        # Add specific detail if there are issues
        if issues and len(issues) > 0:
            # Get first issue and clean it (remove emoji)
            first_issue = issues[0].replace('❌', '').replace('⚠️', '').replace('✨', '').strip()
            return f"{base} {first_issue}"
        
        return base
    
    def calculate_comfort_metrics(self, measurements: Dict, garment_spec: Dict, category: str = 'tops') -> Dict:
        """
        Calculate comfort-focused metrics beyond basic width/length.
        
        Args:
            measurements: User's body measurements
            garment_spec: Garment size specifications
            category: Garment category (tops, bottoms, dresses, etc.)
        
        Returns:
            Dict with comfort_level and movement_freedom (0-100 scale)
        """
        
        # Determine width key based on category
        if category in ['tops', 'outerwear']:
            user_width_key = 'bust'
            garment_width_key = 'chest_width'
        elif category == 'bottoms':
            user_width_key = 'waist'
            garment_width_key = 'waist'
        elif category == 'dresses':
            user_width_key = 'bust'
            garment_width_key = 'bust'
        else:
            user_width_key = 'bust'
            garment_width_key = 'chest_width'
        
        user_width = measurements.get(user_width_key, 0)
        garment_width_flat = garment_spec.get(garment_width_key, 0)
        garment_width = garment_width_flat * 2 if garment_width_flat > 0 else 0
        
        if user_width == 0 or garment_width == 0:
            return {
                'comfort_level': 50,
                'movement_freedom': 50
            }
        
        # Calculate gap (positive = loose, negative = tight)
        gap = garment_width - user_width
        
        # Comfort level: Perfect when gap is 0-2cm, decreases with deviation
        # Gap of 5cm+ overhead is very loose and uncomfortable
        if abs(gap) <= 2:
            comfort_level = 95  # Perfect
        elif abs(gap) <= 5:
            comfort_level = 85  # Very comfortable
        elif abs(gap) <= 8:
            comfort_level = 70  # Comfortable
        elif abs(gap) <= 12:
            comfort_level = 50  # Acceptable
        else:
            comfort_level = 30  # Uncomfortable (too tight or too loose)
        
        # Movement freedom: Based on positive gap (excess fabric)
        # 0-2cm = limited movement (tight)
        # 3-5cm = good movement
        # 6-8cm = excellent movement
        # 9cm+ = too much fabric
        if gap <= 0:
            movement_freedom = 20 + (gap * -5)  # Very limited if tight
        elif gap <= 3:
            movement_freedom = 60
        elif gap <= 6:
            movement_freedom = 85
        elif gap <= 10:
            movement_freedom = 95
        else:
            movement_freedom = 70  # Too much fabric negatively affects movement
        
        # Clamp to 0-100
        comfort_level = max(0, min(100, comfort_level))
        movement_freedom = max(0, min(100, movement_freedom))
        
        return {
            'comfort_level': int(comfort_level),
            'movement_freedom': int(movement_freedom)
        }
    
    def suggest_avatar_posture(self, fit_score: float) -> str:
        """
        Suggest avatar posture based on fit quality.
        Used for visual feedback - avatar appears more/less comfortable based on fit.
        
        Args:
            fit_score: Overall fit score (0-100)
        
        Returns:
            String: posture name (confident, comfortable, neutral, constrained, very_constrained)
        """
        
        if fit_score >= 85:
            return "confident"  # Perfect fit - relaxed and confident stance
        elif fit_score >= 75:
            return "comfortable"  # Good fit - natural, relaxed posture
        elif fit_score >= 60:
            return "neutral"  # Acceptable - neutral standing position
        elif fit_score >= 40:
            return "constrained"  # Poor - slightly constrained stance
        else:
            return "very_constrained"  # Very poor - noticeably uncomfortable posture

# Export
__all__ = ['FitEngine']
