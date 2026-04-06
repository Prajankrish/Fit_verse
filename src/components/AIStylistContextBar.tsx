import React from 'react';
import { Badge } from './ui/badge';
import { Sparkles, Shirt, User } from 'lucide-react';

interface AIStylistContextBarProps {
  selectedGarment?: any;
  bodyType?: string;
  skinTone?: string;
  measurements?: {
    height?: number;
    bust?: number;
    waist?: number;
    hips?: number;
  };
}

/**
 * AI Stylist Context Bar
 * Shows the current context: selected item, body type, and measurements
 */
export const AIStylistContextBar: React.FC<AIStylistContextBarProps> = ({
  selectedGarment,
  bodyType,
  skinTone,
  measurements
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-200/50 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-background p-4 shadow-sm">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent animate-pulse" />
      
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="font-bold text-sm text-foreground">AI Stylist Dashboard</h3>
        </div>

        {/* Context Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Selected Item Context */}
          <div className="p-3 rounded-xl bg-white/50 border border-indigo-100/50 backdrop-blur-sm">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Shirt className="h-3.5 w-3.5" />
              Current Item
            </p>
            {selectedGarment ? (
              <div className="flex items-center gap-2">
                {selectedGarment.image_url && (
                  <img 
                    src={selectedGarment.image_url} 
                    alt={selectedGarment.name}
                    className="w-10 h-12 object-cover rounded-lg border border-border/50"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{selectedGarment.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedGarment.category || 'Clothing'}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Select an item to analyze</p>
            )}
          </div>

          {/* Body Profile Context */}
          <div className="p-3 rounded-xl bg-white/50 border border-purple-100/50 backdrop-blur-sm">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2 flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Your Profile
            </p>
            {bodyType ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Body Type</span>
                  <Badge className="text-xs bg-purple-100 text-purple-700 font-semibold">
                    {bodyType.charAt(0).toUpperCase() + bodyType.slice(1)}
                  </Badge>
                </div>
                {skinTone && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Skin Tone</span>
                    <Badge variant="outline" className="text-xs">{skinTone}</Badge>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Upload photo to detect</p>
            )}
          </div>

          {/* Measurements - if available */}
          {measurements && Object.values(measurements).some(v => v) && (
            <div className="sm:col-span-2 p-3 rounded-xl bg-white/50 border border-emerald-100/50 backdrop-blur-sm">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                Measurements
              </p>
              <div className="grid grid-cols-4 gap-2">
                {measurements.height && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Height</p>
                    <p className="font-semibold text-xs">{measurements.height}cm</p>
                  </div>
                )}
                {measurements.bust && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Bust</p>
                    <p className="font-semibold text-xs">{measurements.bust}cm</p>
                  </div>
                )}
                {measurements.waist && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Waist</p>
                    <p className="font-semibold text-xs">{measurements.waist}cm</p>
                  </div>
                )}
                {measurements.hips && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Hips</p>
                    <p className="font-semibold text-xs">{measurements.hips}cm</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
