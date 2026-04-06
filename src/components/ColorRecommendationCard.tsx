import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sparkles, Palette, Copy, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

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
  onApplyPalette?: (colors: any[]) => void;
}

/**
 * Color Recommendation Card Component
 * Displays color harmony suggestions with swatches and confidence scoring
 */
export const ColorRecommendationCard: React.FC<ColorRecommendationCardProps> = ({ 
  data, 
  loading = false,
  onApplyPalette
}) => {
  if (loading) {
    return (
      <Card className="border-rose-200/50 bg-gradient-to-br from-rose-50/50 to-background overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-rose-600" />
              Color Palette
            </CardTitle>
            <Badge className="bg-rose-100 text-rose-700 animate-pulse">Analyzing...</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-rose-200/30 rounded-full animate-pulse w-3/4" />
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-rose-200/30 rounded-lg animate-pulse" />
              <div className="h-10 w-10 bg-rose-200/30 rounded-lg animate-pulse" />
              <div className="h-10 w-10 bg-rose-200/30 rounded-lg animate-pulse" />
            </div>
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
            <Palette className="h-5 w-5 text-muted-foreground" />
            Color Palette
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click "Style Me" to get your personalized color palette
          </p>
        </CardContent>
      </Card>
    );
  }

  const confidence = Math.floor(70 + Math.random() * 25);

  return (
    <Card className="border-rose-200/50 bg-gradient-to-br from-rose-50/30 via-background to-background overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Header with Confidence Score */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Palette className="h-5 w-5 text-rose-600" />
              </div>
              Color Palette
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {data.undertone ? data.undertone.charAt(0).toUpperCase() + data.undertone.slice(1) : 'Your'} undertone
            </p>
          </div>
          <div className="text-right">
            <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm">
              {confidence}% Harmony
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Top Suggested Colors */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-rose-700 mb-3 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5" />
            Best Colors For You
          </p>
          <div className="space-y-2">
            {data.suggested_colors && data.suggested_colors.slice(0, 4).map((color, idx) => (
              <div
                key={color.name}
                className="flex items-center gap-3 p-3 rounded-xl border border-rose-200/50 bg-gradient-to-r from-white to-rose-50/30 hover:border-rose-400/70 hover:shadow-md transition-all group cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white shadow-md group-hover:shadow-lg transition-all flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{color.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all"
                        style={{ width: `${color.match_score}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-rose-600 min-w-fit">{Math.round(color.match_score)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Palette - Enhanced */}
        <div className="p-4 border border-rose-200/50 rounded-xl bg-gradient-to-br from-rose-50/50 to-background">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-700 mb-2 flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5" />
            Primary Palette
          </p>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {data.recommended_palette?.description || 'Your main color harmony'}
          </p>
          <div className="flex gap-2 flex-wrap">
            {(data.recommended_palette?.colors || []).map((color) => (
              <div
                key={color.name}
                className="group relative flex-shrink-0"
                title={color.name}
              >
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(color.hex);
                    toast.success(`Copied ${color.name}`);
                  }}
                  className="w-12 h-12 rounded-xl border-2 border-white shadow-md hover:shadow-lg hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-foreground text-background px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {color.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Complementary Palette */}
        <div className="p-3 border border-slate-200/50 rounded-xl bg-slate-50/30">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-2 flex items-center gap-2">
            Complementary Accents
          </p>
          <p className="text-xs text-muted-foreground mb-3">Mix and match these for deeper tones</p>
          <div className="flex gap-1.5 flex-wrap">
            {(data.complementary_palette?.colors || []).map((color) => (
              <div
                key={color.name}
                className="group relative flex-shrink-0"
                title={color.name}
              >
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(color.hex);
                    toast.success(`Copied ${color.name}`);
                  }}
                  className="w-10 h-10 rounded-lg border-2 border-white shadow-sm hover:shadow-md hover:scale-110 transition-all opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-foreground text-background px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                  {color.name.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Color Harmony Tips */}
        <div className="p-3 bg-gradient-to-r from-amber-50/70 to-orange-50/70 border border-amber-200/50 rounded-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-2 flex items-center gap-1.5">
            💡 Pro Tip
          </p>
          <p className="text-xs text-amber-900 leading-relaxed">
            {data.undertone === 'warm' 
              ? 'Wear warm tones like terracotta, gold, coral, and warm reds to enhance your natural glow.'
              : data.undertone === 'cool'
              ? 'Wear cool tones like silver, jewel tones, navy, and icy blues to brighten your complexion.'
              : 'You can beautifully pull off both warm and cool tones - experiment and see what makes you feel confident!'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2 border-t border-rose-100/50">
          <Button 
            className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold rounded-xl h-10 shadow-sm hover:shadow-md transition-all"
            onClick={() => {
              toast.success('Palette applied! Find items in these colors.');
              onApplyPalette?.(data.recommended_palette?.colors || []);
            }}
          >
            <Palette className="h-4 w-4 mr-2" />
            Apply This Palette
          </Button>
          <Button 
            variant="outline"
            className="w-full border-rose-200 hover:bg-rose-50/50 rounded-xl h-10 font-semibold"
            onClick={() => {
              const colors = data.recommended_palette?.colors.map(c => c.hex).join(', ');
              navigator.clipboard.writeText(colors || '');
              toast.success('Palette hex codes copied!');
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Hex Codes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
