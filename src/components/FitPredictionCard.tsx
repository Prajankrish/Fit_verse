import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, TrendingUp, AlertTriangle, Zap, Ruler, Gauge, Users, Sparkles, Heart, Activity, Palette } from 'lucide-react';
import { FitPredictionResponse, Garment } from '../utils/api';

interface FitPredictionCardProps {
  garment: Garment;
  size: string;
  fitData: FitPredictionResponse;
}

/**
 * Premium FitPredictionCard Component
 * Displays garment fit prediction with enhanced visual design
 * Includes explanation, fit breakdown with icons, and recommendations
 */
export const FitPredictionCard: React.FC<FitPredictionCardProps> = ({
  garment,
  size,
  fitData,
}) => {
  if (!fitData || !fitData.fit_prediction) return null;
  const { fit_prediction } = fitData;
  const score = fit_prediction.overall_fit_score;
  const confidence = fit_prediction.recommendations?.confidence || score;
  const action = fit_prediction.recommendations?.action || 'MIGHT_WORK';

  // Color scheme based on fit score
  const getScoreColor = (score: number) => {
    if (score >= 85) return { 
      bg: 'from-emerald-50 to-teal-50', 
      border: 'border-emerald-300', 
      headerBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      circle: 'border-emerald-500 bg-emerald-100',
      text: 'text-emerald-700',
      accent: 'emerald'
    };
    if (score >= 75) return { 
      bg: 'from-green-50 to-emerald-50', 
      border: 'border-green-300', 
      headerBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      circle: 'border-green-500 bg-green-100',
      text: 'text-green-700',
      accent: 'green'
    };
    if (score >= 65) return { 
      bg: 'from-blue-50 to-cyan-50', 
      border: 'border-blue-300', 
      headerBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      circle: 'border-blue-500 bg-blue-100',
      text: 'text-blue-700',
      accent: 'blue'
    };
    if (score >= 50) return { 
      bg: 'from-yellow-50 to-amber-50', 
      border: 'border-yellow-300', 
      headerBg: 'bg-gradient-to-r from-yellow-500 to-amber-500',
      circle: 'border-yellow-500 bg-yellow-100',
      text: 'text-yellow-700',
      accent: 'yellow'
    };
    return { 
      bg: 'from-red-50 to-orange-50', 
      border: 'border-red-300', 
      headerBg: 'bg-gradient-to-r from-red-500 to-orange-500',
      circle: 'border-red-500 bg-red-100',
      text: 'text-red-700',
      accent: 'red'
    };
  };

  const getActionBadge = (action: string) => {
    const actions: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
      'BUY_NOW': { 
        label: 'Buy Now', 
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-100 border border-emerald-300',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'RECOMMENDED': { 
        label: 'Recommended', 
        color: 'text-green-700',
        bgColor: 'bg-green-100 border border-green-300',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'MIGHT_WORK': { 
        label: 'Might Work', 
        color: 'text-blue-700',
        bgColor: 'bg-blue-100 border border-blue-300',
        icon: <TrendingUp className="w-4 h-4" />
      },
      'TRY_CAUTION': { 
        label: 'Try with Caution', 
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100 border border-yellow-300',
        icon: <AlertTriangle className="w-4 h-4" />
      },
      'RECONSIDER': { 
        label: 'Reconsider', 
        color: 'text-red-700',
        bgColor: 'bg-red-100 border border-red-300',
        icon: <AlertCircle className="w-4 h-4" />
      },
    };
    
    return actions[action] || actions['MIGHT_WORK'];
  };

  const getQualityBadgeColor = (quality: string) => {
    if (quality === 'Excellent fit') return 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-300';
    if (quality === 'Good fit') return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300';
    if (quality === 'Acceptable fit') return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-300';
    if (quality === 'Poor fit') return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-300';
    return 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border border-red-300';
  };

  const colors = getScoreColor(score);
  const actionBadge = getActionBadge(action);

  // Simplified Fit Bar Component
  const FitBar = ({ label, value, type }: { label: string; value: number; type: 'length' | 'width' | 'body' }) => {
    // Value is 0-100
    const displayValue = Math.min(100, Math.max(0, value));
    
    let status = '';
    let statusColor = 'text-green-600';
    let barColor = 'from-green-500 to-emerald-500';
    
    if (type === 'length') {
      if (displayValue < 40) {
        status = '↑ Too Short';
        statusColor = 'text-red-600';
        barColor = 'from-red-500 to-orange-500';
      } else if (displayValue > 60) {
        status = '↓ Too Long';
        statusColor = 'text-yellow-600';
        barColor = 'from-yellow-500 to-amber-500';
      } else {
        status = '✓ Perfect';
        statusColor = 'text-green-600';
        barColor = 'from-green-500 to-emerald-500';
      }
    } else if (type === 'width') {
      if (displayValue < 40) {
        status = '← Too Tight';
        statusColor = 'text-red-600';
        barColor = 'from-red-500 to-orange-500';
      } else if (displayValue > 60) {
        status = '→ Too Loose';
        statusColor = 'text-yellow-600';
        barColor = 'from-yellow-500 to-amber-500';
      } else {
        status = '✓ Perfect Fit';
        statusColor = 'text-green-600';
        barColor = 'from-green-500 to-emerald-500';
      }
    } else {
      status = '✓ Match';
      statusColor = 'text-indigo-600';
      barColor = 'from-indigo-500 to-blue-500';
    }

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm font-semibold text-gray-700">{label}</span>
          </div>
          <span className={`text-xs font-bold ${statusColor}`}>{status}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${barColor} h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${displayValue}%` }}
          />
        </div>
      </div>
    );
  };

  // Metric detail component
  const MetricBar = ({ 
    icon: Icon, 
    label, 
    value, 
    color 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    value: number;
    color: string;
  }) => {
    let barColor = 'from-red-500 to-orange-500';
    if (value >= 80) barColor = 'from-emerald-500 to-teal-500';
    else if (value >= 70) barColor = 'from-green-500 to-emerald-500';
    else if (value >= 60) barColor = 'from-blue-500 to-cyan-500';
    else if (value >= 50) barColor = 'from-yellow-500 to-amber-500';

    return (
      <div className="mb-4 last:mb-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`${color} p-2 rounded-lg`}>
              {Icon}
            </div>
            <span className="text-sm font-semibold text-gray-700">{label}</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{Math.round(value)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-sm">
          <div
            className={`bg-gradient-to-r ${barColor} h-3 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className={`border-2 ${colors.border} bg-gradient-to-br ${colors.bg} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
      {/* Premium Header */}
      <div className={`${colors.headerBg} h-1 rounded-t-lg`} />
      
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900">{garment.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              {garment.brand} • <span className="font-semibold">Selected Size {size}</span>
            </p>
            {fitData.recommended_size && (
              <p className="text-md font-bold text-emerald-600 mt-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Recommended Size: {fitData.recommended_size}
              </p>
            )}
          </div>

          {/* Enhanced Score Circle */}
          <div className="flex flex-col items-center gap-2 relative">
            {/* Glow effect */}
            <div className={`absolute inset-0 w-24 h-24 rounded-full ${colors.circle} opacity-20 blur-lg`} />
            
            <div
              className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 ${colors.circle} shadow-lg hover:shadow-xl transition-shadow`}
            >
              <span className="text-3xl font-bold text-gray-900">{score}</span>
              <span className="text-xs font-semibold text-gray-600">/100</span>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 font-medium">Confidence</p>
              <p className="text-sm font-bold text-gray-900">{confidence}%</p>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-5">
        {/* Action Badge and Quality Badge Row */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={`${actionBadge.bgColor} ${actionBadge.color} font-semibold px-3 py-1 flex items-center gap-1 text-xs uppercase tracking-wide`}>
            {actionBadge.icon}
            {actionBadge.label}
          </Badge>
          <Badge className={`${getQualityBadgeColor(fit_prediction.fit_quality)} font-semibold px-3 py-1 text-xs`}>
            ✨ {fit_prediction.fit_quality}
          </Badge>
        </div>

        {/* AI Advice Section (Gemini) */}
        {fit_prediction.ai_advice && (
          <div className="bg-gradient-to-r from-violet-100 to-fuchsia-100 p-4 rounded-xl border border-violet-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <h3 className="font-bold text-violet-900 text-sm uppercase tracking-wide">
                AI Stylist Advice
              </h3>
            </div>
            <p className="text-sm text-violet-800 leading-relaxed font-medium relative z-10">
              {fit_prediction.ai_advice}
            </p>
            {/* Background design elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/40 blur-2xl rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/40 blur-2xl rounded-full" />
          </div>
        )}

        {/* Explanation Section - Enhanced */}
        {fit_prediction.explanation && (
          <div className="p-4 rounded-xl bg-white/60 backdrop-blur border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-800 leading-relaxed font-medium">
              💭 {fit_prediction.explanation}
            </p>
          </div>
        )}

        {/* Fit Breakdown Section - Simplified */}
        <div className="bg-white/40 backdrop-blur p-4 rounded-xl border border-gray-200/50">
          <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Fit Details
          </h3>
          <div className="space-y-4">
            <FitBar
              label="Length"
              value={fit_prediction.fit_breakdown.length}
              type="length"
            />
            <FitBar
              label="Width/Chest"
              value={fit_prediction.fit_breakdown.width}
              type="width"
            />
            <FitBar
              label="Body Type Compatibility"
              value={fit_prediction.fit_breakdown.proportional}
              type="body"
            />
          </div>
        </div>

        {/* Color Harmony Section */}
        {fitData.color_harmony && fitData.color_harmony.undertone && (
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl border border-rose-200/60 shadow-sm relative overflow-hidden mt-2">
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Palette className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-rose-900 text-sm uppercase tracking-wide">
                Color & Skin Tone Match
              </h3>
            </div>
            
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                <span className="text-xs text-rose-800 font-medium">Skin Undertone</span>
                <Badge variant="outline" className="bg-white border-rose-200 text-rose-700 capitalize shadow-sm">
                  {fitData.color_harmony.undertone.replace('_', ' ')}
                </Badge>
              </div>
              
              {fitData.color_harmony.recommended_colors && fitData.color_harmony.recommended_colors.length > 0 && (
                <div className="bg-white/40 p-2 rounded-lg mt-1">
                  <p className="text-[10px] text-rose-800 font-bold mb-2 uppercase tracking-tight">Best Palette For You</p>
                  <div className="flex flex-wrap gap-1.5">
                    {fitData.color_harmony.recommended_colors.slice(0, 4).map((color: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-1 bg-white border border-rose-100 rounded-md text-gray-700 shadow-sm capitalize font-medium">
                        {color.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Background design elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/40 blur-2xl rounded-full" />
          </div>
        )}

        {/* Comfort Metrics Section */}
        {fit_prediction.comfort_metrics && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/60 backdrop-blur p-3 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg text-rose-600 shadow-inner">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Comfort</p>
                <p className="font-bold text-gray-900">{fit_prediction.comfort_metrics.comfort_level}/100</p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur p-3 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg text-indigo-600 shadow-inner">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Mobility</p>
                <p className="font-bold text-gray-900">{fit_prediction.comfort_metrics.movement_freedom}/100</p>
              </div>
            </div>
          </div>
        )}

        {/* Issues Section - Enhanced */}
        {fit_prediction.issues && fit_prediction.issues.length > 0 && (
          <div className="bg-gradient-to-br from-orange-50/80 to-red-50/50 p-4 rounded-xl border border-orange-200/50 shadow-sm">
            <p className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" /> Assessment
            </p>
            <ul className="space-y-2">
              {fit_prediction.issues.map((issue, idx) => (
                <li key={idx} className="text-sm text-gray-700 leading-relaxed pl-4 border-l-2 border-orange-300">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations Section - Enhanced */}
        {fit_prediction.recommendations && fit_prediction.recommendations.suggestions && (
          <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/50 p-4 rounded-xl border border-amber-200/50 shadow-sm">
            <p className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" /> Recommendations
            </p>
            <ul className="space-y-2">
              {fit_prediction.recommendations.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-gray-700 leading-relaxed pl-4 border-l-2 border-amber-300">
                  ✓ {suggestion}
                </li>
              ))}
            </ul>

            {/* Low Confidence Tips */}
            {confidence < 60 && (
              <div className="mt-3 p-3 bg-white/60 border border-amber-200 rounded-lg">
                <p className="text-xs font-bold text-amber-900 mb-2">💡 Tips for Better Accuracy</p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Review your measurements manually</li>
                  <li>• Try comparing different sizes</li>
                  <li>• Check customer reviews for fit details</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Size Info */}
        {confidence >= 65 && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50">
            <p className="text-xs font-semibold text-blue-900 mb-1">📏 Size Information</p>
            <p className="text-xs text-blue-800">Try other sizes to find alternatives that might work better for you.</p>
          </div>
        )}

        {/* Garment Details - Footer */}
        <div className="pt-4 border-t border-gray-200/50">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50/60 p-2 rounded-lg">
              <p className="text-gray-600 font-medium">Price</p>
              <p className="font-bold text-gray-900">${garment.price}</p>
            </div>
            <div className="bg-gray-50/60 p-2 rounded-lg">
              <p className="text-gray-600 font-medium">Fabric</p>
              <p className="font-bold text-gray-900 truncate">{garment.fabric}</p>
            </div>
            <div className="bg-gray-50/60 p-2 rounded-lg">
              <p className="text-gray-600 font-medium">Stretch</p>
              <p className="font-bold text-gray-900">{garment.stretch_percentage}%</p>
            </div>
            {garment.fit_notes && (
              <div className="bg-gray-50/60 p-2 rounded-lg">
                <p className="text-gray-600 font-medium">Design</p>
                <p className="font-bold text-gray-900 text-xs truncate">{garment.fit_notes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
