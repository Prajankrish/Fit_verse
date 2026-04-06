import { useState } from 'react';
import { api, BodyAnalysisResponse } from '../utils/api';

export const useBodyAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BodyAnalysisResponse | null>(null);

  const analyze = async (file: File): Promise<BodyAnalysisResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.analyzeBody(file);
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
    bodyType: result?.body_type,
    skinTone: result?.skin_tone,
    measurements: result?.measurements,
    gender: result?.gender
  };
};
