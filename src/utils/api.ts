// API Client for FitVerse Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface BodyAnalysisResponse {
  success: boolean;
  measurement_id: number;
  body_analysis: {
    body_type: string;
    confidence: number;
    skin_tone_hsl: string;
    analysis_confidence: number;
  };
  measurements: {
    height: number;
    bust: number;
    waist: number;
    hips: number;
    shoulder_width: number;
    inseam: number;
  };
}

export interface FitPredictionRequest {
  measurement_id: number;
  garment_id: string;
  selected_size: string;
}

export interface FitPredictionResponse {
  success: boolean;
  fit_prediction: {
    overall_fit_score: number;
    fit_quality: string;
    fit_breakdown: {
      length: number;
      width: number;
      proportional: number;
    };
    issues: string[];
    recommendations: {
      should_buy: boolean;
      suggestions: string[];
      confidence?: number;
      action?: string;
    };
    // Phase 1 Enhancement Fields
    explanation?: string;
    ai_advice?: string;
    comfort_metrics?: {
      comfort_level: number;
      movement_freedom: number;
    };
    avatar_posture?: string;
  };
  color_harmony?: {
    undertone?: string;
    complementary_palette?: string[];
    recommended_colors?: string[];
  };
  skin_tone_hsl?: string;
}

export interface Garment {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  fabric: string;
  stretch_percentage: number;
  image_url: string;
  target_body_types: string[];
  fit_notes: string;
  specifications: {
    sizes: {
      [key: string]: {
        chest_width?: number;
        length?: number;
        sleeve_length?: number;
        waist?: number;
        hip?: number;
        inseam?: number;
        bust?: number;
      };
    };
  };
}

export interface Measurement {
  id: number;
  user_id: number;
  height: number;
  bust: number;
  waist: number;
  hips: number;
  shoulder_width: number;
  inseam: number;
  body_type: string;
  skin_tone_hsl: string;
  analysis_confidence: number;
  created_at: string;
}

export const api = {
  /**
   * Check if backend API is running
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  /**
   * Analyze body from photo - main pipeline
   * Detects pose → estimates height → classifies body type → extracts skin tone
   * @param file - Image file (JPG, PNG)
   * @param email - Optional user email
   * @returns Body analysis with measurements
   */
  async analyzeBody(file: File, email?: string): Promise<BodyAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (email) formData.append('email', email);

    const response = await fetch(`${API_BASE_URL}/api/v1/analyze-body`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Analysis failed: ${error.detail || response.statusText}`);
    }

    return response.json();
  },

  /**
   * Predict how well a garment will fit
   * Compares user measurements against garment specs
   * @param measurementId - ID from body analysis
   * @param garmentId - Product ID from garment database
   * @param size - Size (XS, S, M, L, XL)
   * @returns Fit prediction with score and recommendations
   */
  async predictFit(
    measurementId: number | null,
    garmentId: string,
    size: string,
    measurements?: any
  ): Promise<FitPredictionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/predict-fit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        measurement_id: measurementId,
        garment_id: garmentId,
        selected_size: size,
        measurements: measurements,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Fit prediction failed: ${error.detail || response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get all available garments
   * @returns List of all products in database
   */
  async getGarments(
    limit: number = 50, 
    offset: number = 0, 
    search: string = '', 
    category: string = '',
    gender: string = ''
  ): Promise<{ garments: Garment[], total: number }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (gender) params.append('gender', gender);

    const response = await fetch(`${API_BASE_URL}/api/v1/garments?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to load garments');
    }
    return response.json();
  },

  /**
   * Get specific garment details
   * @param garmentId - Product ID
   * @returns Garment object with full specifications
   */
  async getGarment(garmentId: string): Promise<Garment> {
    const response = await fetch(`${API_BASE_URL}/api/v1/garments/${garmentId}`);
    if (!response.ok) {
      throw new Error('Failed to load garment');
    }
    return response.json();
  },

  /**
   * Get previously saved measurements
   * @param measurementId - ID from body analysis
   * @returns Stored measurement record
   */
  async getMeasurement(measurementId: number): Promise<Measurement> {
    const response = await fetch(`${API_BASE_URL}/api/v1/measurement/${measurementId}`);
    if (!response.ok) {
      throw new Error('Failed to load measurement');
    }
    return response.json();
  },

  /**
   * Get color recommendations based on skin tone
   * Suggests complementary, analogous, and triadic colors
   * @param skinToneHsl - Skin tone in HSL format (e.g., "22 45% 65%")
   * @param limit - Maximum colors to suggest
   * @returns Color recommendations with harmonies
   */
  async getColorRecommendations(skinToneHsl: string, limit = 5) {
    const response = await fetch(`${API_BASE_URL}/api/v1/color-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skin_tone_hsl: skinToneHsl,
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get color recommendations');
    }
    return response.json();
  },

  /**
   * Get style recommendations based on body type
   * Suggests fashion styles and flattering pieces
   * @param bodyType - Body type (slim, average, athletic, etc.)
   * @param occasion - Optional occasion (work, casual, formal, etc.)
   * @returns Style recommendations and tips
   */
  async getStyleRecommendations(bodyType: string, occasion?: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/style-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body_type: bodyType,
        occasion,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get style recommendations');
    }
    return response.json();
  },

  /**
   * Get personalized garment recommendations
   * Combines fit, color matching, and style compatibility
   * @param measurementId - ID from body analysis
   * @param skinToneHsl - Skin tone for color matching
   * @param bodyType - Body type for style matching
   * @param limit - Maximum recommendations to return
   * @returns Scored garment recommendations
   */
  async getGarmentRecommendations(
    measurementId: number,
    skinToneHsl: string,
    bodyType: string,
    limit = 6
  ) {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/garment-recommendations?measurement_id=${measurementId}&skin_tone_hsl=${encodeURIComponent(skinToneHsl)}&body_type=${bodyType}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to get garment recommendations');
    }
    return response.json();
  },

    /**
     * Save a combination to the wishlist
     */
    async addToWishlist(wishlistData: any) {
      const response = await fetch(`${API_BASE_URL}/api/v1/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wishlistData),
      });

      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }
      return response.json();
    },

    /**
     * Get all wishlist items
     */
    async getWishlist(userId?: number) {
      const url = userId ? `${API_BASE_URL}/api/v1/wishlist?user_id=${userId}` : `${API_BASE_URL}/api/v1/wishlist`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      return response.json();
    }
};
