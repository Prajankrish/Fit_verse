// src/utils/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface BodyAnalysisResponse {
  success: boolean;
  measurements: {
    height: number;
    chest: number;
    waist: number;
    hips: number;
  };
  body_type: string;
  gender: string;
  skin_tone: string;
}

export interface AvatarResponse {
  scale_x: number;
  scale_y: number;
  scale_z: number;
  body_shape: string;
}

export interface Garment {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  image_url?: string;
  size?: string;
  [key: string]: any;
}

export interface ProductResponse {
  garments: Garment[];
}

export interface FitPredictionResponse {
  fit_prediction: {
    overall_fit_score: number;
    fit_quality: string;
    recommendations: {
      confidence: number;
      action: string;
      suggestions: string[];
    };
    ai_advice?: string;
    explanation?: string;
    fit_breakdown: {
      length: number;
      width: number;
      proportional: number;
    };
    width_fit?: string;
    length_fit?: string;
    width_score?: number;
    length_score?: number;
    comfort_metrics?: {
      comfort_level: number;
      movement_freedom: number;
    };
    issues: string[];
  };
  recommended_size?: string;
  color_harmony?: {
    undertone?: string;
    recommended_colors?: string[];
  };
}

export interface StyleRecommendationResponse {
  recommended_styles: string[];
}

export interface ColorRecommendationResponse {
  recommended_colors: string[];
}

export const api = {
  analyzeBody: async (file: File): Promise<BodyAnalysisResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(`${API_URL}/analyze-body`, formData);
    return response.data;
  },

  generateAvatar: async (measurements: any): Promise<AvatarResponse> => {
    const response = await axios.post(`${API_URL}/generate-avatar`, { measurements });
    return response.data;
  },

  getProducts: async (): Promise<ProductResponse> => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },

  getGarments: async (limit: number = 50, offset: number = 0, search: string = '', category: string = '', gender: string = ''): Promise<{ garments: Garment[], total: number }> => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      let allGarments = response.data.garments || [];

      if (category && category.toLowerCase() !== 'all') {
        const catFilter = category.toLowerCase();
        allGarments = allGarments.filter((g: any) => (g.category || '').toLowerCase() === catFilter);
      }
      
      if (gender && gender.toLowerCase() !== 'all') {
        const genFilter = gender.toLowerCase();
        allGarments = allGarments.filter((g: any) => (g.ideal_for || g.gender || '').toLowerCase() === genFilter);
      }

      if (search) {
        const query = search.toLowerCase();
        allGarments = allGarments.filter((g: any) => 
          (g.name || g.product_details || '').toLowerCase().includes(query) || 
          (g.brand || '').toLowerCase().includes(query)
        );
      }

      // Provide total count before pagination
      const total = allGarments.length;

      // Paginate
      const paginated = allGarments.slice(offset, offset + limit);

      // Clean images
      paginated.forEach((item: any) => {
        item.image = item.image || item.img_url;
        item.id = item.id || item.product_id;
      });

      return {
        garments: paginated,
        total
      };
    } catch (e) {
      console.error(e);
      return { garments: [], total: 0 };
    }
  },

  predictFit: async (measurements: any, garment: any, size: string, body_type: string = ''): Promise<FitPredictionResponse> => {
    // Convert to exactly what the ML backend expects
    const userPayload = {
      chest: measurements.chest || 0,
      waist: measurements.waist || 0,
      hips: measurements.hips || 0,
      height: measurements.height || 0,
      body_type: body_type || measurements.body_type || ''
    };
    
    // Scale fallback specs across sizes so M vs XXL are distinct
    let baseChest = garment.chest || 100;
    let baseWaist = garment.waist || 90;
    let baseLength = garment.length || 72;
    
    if (!garment?.specifications?.sizes?.[size]) {
      const scaleMap: any = { 'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.16, 'XXL': 1.25, '3XL': 1.35 };
      
      // If sizes object exists but requested size is missing, use an existing size to accurately anchor the base measurements
      const sizesObj = garment?.specifications?.sizes;
      if (sizesObj && Object.keys(sizesObj).length > 0) {
        const refSizeStr = Object.keys(sizesObj).includes('M') ? 'M' : Object.keys(sizesObj)[0];
        const ref = sizesObj[refSizeStr];
        const refScale = scaleMap[refSizeStr] || 1.0;
        
        baseChest = (ref.chest || ref.bust || (ref.chest_width ? ref.chest_width * 2 : baseChest)) / refScale;
        baseWaist = (ref.waist || (ref.waist_width ? ref.waist_width * 2 : baseWaist)) / refScale;
        baseLength = ref.length || baseLength;
      }

      const scale = scaleMap[size] || 1.0;
      baseChest = Math.round(baseChest * scale);
      baseWaist = Math.round(baseWaist * scale);
      baseLength = Math.round(baseLength * (1 + (scale - 1) * 0.5));
    }

    const garmentPayload = {
      size: size,
      garment_chest: garment?.specifications?.sizes?.[size]?.chest || garment?.specifications?.sizes?.[size]?.bust || (garment?.specifications?.sizes?.[size]?.chest_width ? garment.specifications.sizes[size].chest_width * 2 : null) || baseChest,
      garment_waist: garment?.specifications?.sizes?.[size]?.waist || (garment?.specifications?.sizes?.[size]?.waist_width ? garment.specifications.sizes[size].waist_width * 2 : null) || baseWaist,
      garment_length: garment?.specifications?.sizes?.[size]?.length || baseLength
    };

    const response = await axios.post(`${API_URL}/predict-fit-advanced`, {
      user: userPayload,
      garment: garmentPayload
    });
    
    const mlData = response.data;
    
    // UI calibration based on hybrid engine outputs
    // Scores are returned as 0-1, so multiply by 100 for UI
    const widthScore = Math.round(mlData.width_score * 100);
    const lengthScore = Math.round(mlData.length_score * 100);
    const avgScore = Math.round((widthScore + lengthScore) / 2);
    
    let action = "MIGHT_WORK";
    if (mlData.overall_fit === "Excellent" || mlData.overall_fit === "Perfect") action = "BUY_NOW";
    else if (mlData.overall_fit === "Average") action = "RECOMMENDED";
    else if (mlData.overall_fit === "Poor") action = "RECONSIDER";
    
    return {
      fit_prediction: {
        overall_fit_score: avgScore,
        fit_quality: `${mlData.overall_fit} fit`,
        recommendations: {
          confidence: Math.round(mlData.confidence * 100),
          action: action,
          suggestions: [mlData.explanation]
        },
        ai_advice: mlData.explanation,
        explanation: mlData.explanation,
        fit_breakdown: {
          length: lengthScore,
          width: widthScore,
          proportional: avgScore
        },
        width_fit: mlData.width_fit,
        length_fit: mlData.length_fit,
        width_score: mlData.width_score,
        length_score: mlData.length_score,
        comfort_metrics: {
          comfort_level: avgScore,
          movement_freedom: Math.round((widthScore + lengthScore) / 2)
        },
        issues: mlData.overall_fit === "Poor" ? [mlData.explanation] : []
      },
      recommended_size: mlData.recommended_size || size
    };
  },

  recommendStyle: async (measurements: any, body_type: string, gender: string): Promise<StyleRecommendationResponse> => {
    const response = await axios.post(`${API_URL}/recommend-style`, {
      measurements,
      body_type,
      gender
    });
    return response.data;
  },

  recommendColor: async (skin_tone: string): Promise<ColorRecommendationResponse> => {
    const response = await axios.post(`${API_URL}/recommend-color`, {
      skin_tone
    });
    return response.data;
  }
};
