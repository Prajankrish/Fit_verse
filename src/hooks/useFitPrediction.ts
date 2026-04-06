import { useState, useEffect } from 'react';
import { api, FitPredictionResponse, Garment } from '../utils/api';

export const useFitPrediction = (
  garment: Garment | null,
  size: string,
  measurements: any,
  measurementId?: any
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FitPredictionResponse | null>(null);

  const fetchPrediction = async () => {
    if (!garment || !size) {
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.predictFit(measurements, garment, size, measurements.body_type);
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Fit prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [garment?.id, size, JSON.stringify(measurements)]);

  return {
    fitResults: result,
    loading,
    error,
    result,
    fitScore: result?.fit_prediction?.overall_fit_score,
    fitQuality: result?.fit_prediction?.fit_quality,
    issues: result?.fit_prediction?.issues || [],
    recommendedSize: result?.recommended_size || size,
    analyzeFit: fetchPrediction
  };
};
