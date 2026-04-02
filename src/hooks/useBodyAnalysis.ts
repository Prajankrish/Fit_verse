import { useState } from 'react';
import { api, BodyAnalysisResponse } from '../utils/api';

/**
 * Hook for analyzing body from photo
 * Handles file upload, loading states, and error handling
 */
export const useBodyAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BodyAnalysisResponse | null>(null);

  const analyze = async (file: File, email?: string): Promise<BodyAnalysisResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.analyzeBody(file, email);
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Body analysis error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return {
    analyze,
    reset,
    loading,
    error,
    result,
    // Convenience accessors
    bodyType: result?.body_analysis.body_type,
    bodyTypeConfidence: result?.body_analysis.confidence,
    skinToneHsl: result?.body_analysis.skin_tone_hsl,
    measurements: result?.measurements,
    measurementId: result?.measurement_id,
  };
};
