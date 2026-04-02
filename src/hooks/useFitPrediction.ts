import { useState, useEffect } from 'react';
import { api, FitPredictionResponse, Garment } from '../utils/api';

/**
 * Hook for predicting garment fit
 * Handles fit prediction API calls, loading states, and error handling
 */
export const useFitPrediction = (
  garment: Garment | null,
  size: string,
  measurements: any,
  measurementId?: number
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FitPredictionResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPrediction = async () => {
      if (!garment || !size) {
        setResult(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await api.predictFit(measurementId || null, garment.id, size, measurements);
        if (isMounted) {
          setResult(data);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(message);
          console.error('Fit prediction error:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPrediction();

    return () => {
      isMounted = false;
    };
  }, [garment?.id, size, JSON.stringify(measurements), measurementId]);

  return {
    fitResults: result?.fit_prediction,
    loading,
    error,
    result,
    fitScore: result?.fit_prediction?.overall_fit_score,
    fitQuality: result?.fit_prediction?.fit_quality,
    fitBreakdown: result?.fit_prediction?.fit_breakdown,
    issues: result?.fit_prediction?.issues,
    recommendations: result?.fit_prediction?.recommendations,
  };
};
