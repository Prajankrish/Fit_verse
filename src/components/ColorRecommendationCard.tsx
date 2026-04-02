import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sparkles, Palette } from 'lucide-react';

interface ColorPalette {
  name: string;
  description: string;
  colors: Array<{
    name: string;
    hex: string;
    hsl: string;
  }>;
}

interface ColorRecommendation {
  skin_tone_hsl: string;
  undertone: string;
  recommended_palette: ColorPalette;
  complementary_palette: ColorPalette;
  seasonal_recommendations: Record<string, any>;
  suggested_colors: Array<{
    name: string;
    hex: string;
    match_score: number;
  }>;
}

interface ColorRecommendationCardProps {
  data: ColorRecommendation | null;
  loading?: boolean;
}

/**
 * Color Recommendation Card Component
 * Displays color harmony suggestions based on skin tone
 */
export const ColorRecommendationCard: React.FC<ColorRecommendationCardProps> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Color Recommendations
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
            <Palette className="h-5 w-5 text-muted-foreground" />
            Color Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete body analysis to see personalized color recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Color Recommendations
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Based on your {data.undertone} undertone
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Suggested Colors */}
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
            Top Recommended Colors
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {data.suggested_colors && data.suggested_colors.slice(0, 4).map((color) => (
              <div
                key={color.name}
                className="flex items-center gap-3 p-2 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  title={color.hsl}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{color.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(color.match_score)}% match
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Palette */}
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
            {data.recommended_palette?.name}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {data.recommended_palette?.description}
          </p>
          <div className="flex gap-2 flex-wrap">
            {(data.recommended_palette?.colors || []).map((color) => (
              <div
                key={color.name}
                className="group relative"
                title={color.name}
              >
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border/50 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap bg-popover text-popover-foreground px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {color.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Complementary Palette */}
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
            {data.complementary_palette?.name}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {data.complementary_palette?.description}
          </p>
          <div className="flex gap-2 flex-wrap">
            {(data.complementary_palette?.colors || []).map((color) => (
              <div
                key={color.name}
                className="group relative"
                title={color.name}
              >
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border/50 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer opacity-60 hover:opacity-100"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap bg-popover text-popover-foreground px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {color.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Color Tip */}
        <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
          <p className="text-xs font-medium text-primary mb-1">💡 Color Tip</p>
          <p className="text-xs text-muted-foreground">
            {data.undertone === 'warm' 
              ? 'Warm tones like terracotta, gold, and rust complement your skin beautifully.'
              : 'Cool tones like silver, jewel tones, and ice blue enhance your natural coloring.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


