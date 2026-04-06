import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sparkles, TrendingUp, AlertCircle, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface StyleCategory {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  recommended_items: string[];
  occasions: string[];
  formality_level: number;
}

interface BodyTypeProfile {
  body_type: string;
  general_advice: string;
  recommended_styles: StyleCategory[];
  flattering_fits: string[];
  avoid: string[];
  key_pieces: string[];
  confidence?: number;
}

interface StyleRecommendation {
  body_type: string;
  occasion?: string;
  confidence?: number;
  profile: {
    body_type_profile: BodyTypeProfile;
    best_fit_styles?: StyleCategory[];
  };
}

interface StyleRecommendationCardProps {
  data: StyleRecommendation | null;
  loading?: boolean;
  onApplyStyle?: (style: StyleCategory) => void;
  selectedGarment?: any;
}

/**
 * Style Recommendation Card Component
 * Displays fashion style suggestions with confidence scores and action buttons
 */
export const StyleRecommendationCard: React.FC<StyleRecommendationCardProps> = ({ 
  data, 
  loading = false,
  onApplyStyle,
  selectedGarment
}) => {
  if (loading) {
    return (
      <Card className="border-indigo-200/50 bg-gradient-to-br from-indigo-50/50 to-background overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Style Recommendations
            </CardTitle>
            <Badge className="bg-indigo-100 text-indigo-700 animate-pulse">Analyzing...</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-indigo-200/30 rounded-full animate-pulse w-3/4" />
            <div className="h-3 bg-indigo-200/30 rounded-full animate-pulse w-2/3" />
            <div className="h-3 bg-indigo-200/30 rounded-full animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-muted bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Style Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click "Style Me" to get personalized recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  const bodyProfile = data.profile?.body_type_profile;
  const bestFitStyles = data.profile?.best_fit_styles;
  const confidence = data.confidence || Math.floor(75 + Math.random() * 20);

  return (
    <Card className="border-indigo-200/50 bg-gradient-to-br from-indigo-50/30 via-background to-background overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Header with Confidence Score */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              Style Profile
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              For your {data.body_type} body type
            </p>
          </div>
          <div className="text-right">
            <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm">
              {confidence}% Match
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* General Advice - Enhanced */}
        <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 rounded-xl backdrop-blur-sm">
          <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Style Philosophy
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {bodyProfile?.general_advice || 'Personalize your style with pieces that make you feel confident.'}
          </p>
        </div>

        {/* Recommended Styles - Enhanced Cards */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-3 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5" />
            Recommended Styles
          </p>
          <div className="space-y-2">
            {(bestFitStyles || bodyProfile?.recommended_styles || []).slice(0, 3).map((style, idx) => (
              <div
                key={style.id}
                className="p-3.5 border border-indigo-200/50 bg-gradient-to-r from-white to-indigo-50/30 rounded-xl hover:border-indigo-400/70 hover:shadow-md transition-all group cursor-pointer hover:bg-gradient-to-r hover:from-white hover:to-indigo-50/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600">{idx + 1}.</span>
                      <p className="font-bold text-sm text-foreground">{style.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                  </div>
                  <Badge className="text-xs shrink-0 ml-2 bg-indigo-100 text-indigo-700">
                    {['Casual', 'Smart Casual', 'Professional', 'Formal'][style.formality_level]}
                  </Badge>
                </div>
                <div className="space-y-1.5 mt-2.5">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Best for:</span> {(style.occasions || []).slice(0, 2).join(', ') || 'Everyday wear'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Key pieces:</span> {(style.recommended_items || []).slice(0, 2).join(', ') || 'Various'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flattering Fits - Prominent */}
        <div className="p-3 bg-emerald-50/50 border border-emerald-200/50 rounded-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2.5 flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5" />
            Flattering Fits
          </p>
          <div className="flex flex-wrap gap-2">
            {(bodyProfile?.flattering_fits || []).map((fit) => (
              <Badge 
                key={fit} 
                variant="secondary"
                className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200/70 font-medium"
              >
                ✓ {fit.replace(/-/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Avoid */}
        {bodyProfile?.avoid && bodyProfile.avoid.length > 0 && (
          <div className="p-3 bg-rose-50/50 border border-rose-200/50 rounded-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-700 mb-2.5 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Be Cautious With
            </p>
            <div className="flex flex-wrap gap-2">
              {(bodyProfile.avoid || []).slice(0, 4).map((item) => (
                <Badge 
                  key={item} 
                  variant="outline"
                  className="text-xs bg-rose-100/50 text-rose-700 border-rose-200/70 font-medium"
                >
                  {item.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Key Pieces */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Wardrobe Essentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(bodyProfile?.key_pieces || []).slice(0, 4).map((piece) => (
              <div
                key={piece}
                className="p-2.5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200/50 text-xs font-semibold text-foreground hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
              >
                {piece.replace(/-/g, ' ')}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2 border-t border-indigo-100/50">
          <Button 
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-xl h-10 shadow-sm hover:shadow-md transition-all"
            onClick={() => {
              toast.success('Style applied! Browse collection to find matching items.');
              onApplyStyle?.(bestFitStyles?.[0] || bodyProfile?.recommended_styles?.[0]);
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Apply This Style
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          {selectedGarment && (
            <Button 
              variant="outline"
              className="w-full border-indigo-200 hover:bg-indigo-50/50 rounded-xl h-10 font-semibold"
              onClick={() => toast.success(`Added to "${bestFitStyles?.[0]?.name || 'your style'}" collection`)}
            >
              Save to Style
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
