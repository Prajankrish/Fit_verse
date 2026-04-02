import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

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
}

interface StyleRecommendation {
  body_type: string;
  occasion?: string;
  profile: {
    body_type_profile: BodyTypeProfile;
    best_fit_styles?: StyleCategory[];
  };
}

interface StyleRecommendationCardProps {
  data: StyleRecommendation | null;
  loading?: boolean;
}

/**
 * Style Recommendation Card Component
 * Displays fashion style suggestions based on body type
 */
export const StyleRecommendationCard: React.FC<StyleRecommendationCardProps> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Style Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Style Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete body analysis to see personalized style recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  const bodyProfile = data.profile?.body_type_profile;
  const bestFitStyles = data.profile?.best_fit_styles;

  return (
    <Card className="border-primary/20 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Style Recommendations
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          For your {data.body_type} body type {data.occasion ? `• ${data.occasion} occasion` : ''}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Advice */}
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
          <p className="text-sm font-medium text-foreground mb-2">✨ Key Style Advice</p>
          <p className="text-sm text-muted-foreground">
            {bodyProfile?.general_advice || 'Personalize your style with pieces that make you feel confident.'}
          </p>
        </div>

        {/* Recommended Styles */}
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
            Recommended Styles
          </p>
          <div className="space-y-3">
            {(bestFitStyles || bodyProfile?.recommended_styles || []).slice(0, 3).map((style) => (
              <div
                key={style.id}
                className="p-3 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{style.name}</p>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                    {['Casual', 'Smart Casual', 'Professional', 'Formal'][style.formality_level]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Best for:</span> {(style.occasions || []).slice(0, 2).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Recommended pieces:</span> {(style.recommended_items || []).slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flattering Fits */}
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
            ✓ Flattering Fits for You
          </p>
          <div className="flex flex-wrap gap-2">
            {(bodyProfile?.flattering_fits || []).map((fit) => (
              <Badge key={fit} variant="outline" className="text-xs bg-green-50 text-green-800 border-green-200">
                {fit.replace(/-/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Avoid */}
        {bodyProfile?.avoid && bodyProfile.avoid.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Avoid or Be Cautious
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {(bodyProfile.avoid || []).map((item) => (
                <Badge key={item} variant="outline" className="text-xs bg-red-50 text-red-800 border-red-200">
                  {item.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Key Pieces */}
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
            Wardrobe Essentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(bodyProfile?.key_pieces || []).map((piece) => (
              <div
                key={piece}
                className="p-2 bg-muted/50 rounded border border-border/50 text-xs font-medium text-foreground hover:bg-primary/10 transition-colors cursor-default"
              >
                {piece.replace(/-/g, ' ')}
              </div>
            ))}
          </div>
        </div>

        {/* Style Tip */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-medium text-amber-900 mb-1">💭 Style Tip</p>
          <p className="text-xs text-amber-800">
            Mix and match pieces that make you feel confident and comfortable. 
            Your personal style is unique to you!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
