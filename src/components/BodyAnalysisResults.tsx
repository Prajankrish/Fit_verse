import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BodyAnalysisResponse } from '../utils/api';

interface BodyAnalysisResultsProps {
  data: BodyAnalysisResponse;
}

/**
 * Body Analysis Results Component
 * Displays measurements, body type, confidence scores, and skin tone
 */
export const BodyAnalysisResults: React.FC<BodyAnalysisResultsProps> = ({ data }) => {
  const { body_analysis, measurements } = data;

  const getBodyTypeColor = (bodyType: string): string => {
    const colors: Record<string, string> = {
      slim: 'bg-blue-100 text-blue-800',
      average: 'bg-green-100 text-green-800',
      athletic: 'bg-orange-100 text-orange-800',
      muscular: 'bg-red-100 text-red-800',
      curvy: 'bg-pink-100 text-pink-800',
      'plus-size': 'bg-purple-100 text-purple-800',
      petite: 'bg-yellow-100 text-yellow-800',
      tall: 'bg-indigo-100 text-indigo-800',
    };
    return colors[bodyType] || 'bg-gray-100 text-gray-800';
  };

  const confidencePercentage = (confidence: number) => `${(confidence * 100).toFixed(1)}%`;

  return (
    <div className="w-full space-y-4">
      {/* Analysis Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Body Analysis Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Body Type:</span>
            <Badge className={getBodyTypeColor(body_analysis.body_type)}>
              {body_analysis.body_type.charAt(0).toUpperCase() + body_analysis.body_type.slice(1)}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Confidence:</span>
            <span className="text-lg font-bold text-blue-600">{confidencePercentage(body_analysis.confidence)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Analysis Quality:</span>
            <span className="text-lg font-bold text-green-600">{confidencePercentage(body_analysis.analysis_confidence)}</span>
          </div>

          {/* Skin Tone */}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Skin Tone (HSL):</span>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: `hsl(${body_analysis.skin_tone_hsl})` }}
                title={body_analysis.skin_tone_hsl}
              />
              <span className="text-sm text-gray-600">{body_analysis.skin_tone_hsl}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurements */}
      <Card>
        <CardHeader>
          <CardTitle>Measurements (cm)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Height</p>
              <p className="text-2xl font-bold text-gray-900">{measurements.height.toFixed(1)}</p>
              <p className="text-xs text-gray-500">cm</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Bust</p>
              <p className="text-2xl font-bold text-gray-900">{measurements.bust.toFixed(1)}</p>
              <p className="text-xs text-gray-500">cm</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Waist</p>
              <p className="text-2xl font-bold text-gray-900">{measurements.waist.toFixed(1)}</p>
              <p className="text-xs text-gray-500">cm</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Hips</p>
              <p className="text-2xl font-bold text-gray-900">{measurements.hips.toFixed(1)}</p>
              <p className="text-xs text-gray-500">cm</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Shoulder Width</p>
              <p className="text-2xl font-bold text-gray-900">{measurements.shoulder_width.toFixed(1)}</p>
              <p className="text-xs text-gray-500">cm</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Inseam</p>
              <p className="text-2xl font-bold text-gray-900">{measurements.inseam.toFixed(1)}</p>
              <p className="text-xs text-gray-500">cm</p>
            </div>
          </div>

          {/* Measurement ID for Reference */}
          <div className="mt-6 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600">
              Measurement ID: <span className="font-mono font-semibold text-gray-900">{data.measurement_id}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Use this ID to check garment fit predictions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
