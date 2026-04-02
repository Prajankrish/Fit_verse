import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface FitAnalysisPanelProps {
  userMeasurements: { chest?: number; waist?: number; hips?: number; bust?: number };
  productMeasurements: { chest?: number; waist?: number; hips?: number; bust?: number; chest_width?: number; waist_width?: number };
  selectedSize?: string;
  className?: string;
}

export function FitAnalysisPanel({ userMeasurements, productMeasurements, selectedSize = "M", className = "" }: FitAnalysisPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fitData, setFitData] = useState<{
    fit: string;
    score: number;
    details: { chest?: string; waist?: string; hips?: string };
  } | null>(null);

  useEffect(() => {
    // Only attempt fetch if we have somewhat valid looking data
    const normalizedUser = {
      chest: userMeasurements.chest || userMeasurements.bust || 90,
      waist: userMeasurements.waist || 70,
    };
    
    // Convert flat width (common in size charts) to circumference
    const chestWidthCirc = productMeasurements.chest_width ? productMeasurements.chest_width * 2 : null;
    const waistWidthCirc = productMeasurements.waist_width ? productMeasurements.waist_width * 2 : (chestWidthCirc ? chestWidthCirc * 0.9 : null);

    // Advanced Sizing Scalar: Maps standard retail increments if DB data falls back
    const standardGradeCM = 4.5;
    const sizeOffsets: Record<string, number> = {
      "XS": -2 * standardGradeCM,
      "S": -1 * standardGradeCM,
      "M": 0,
      "L": 1 * standardGradeCM,
      "XL": 2 * standardGradeCM,
      "XXL": 3 * standardGradeCM,
    };
    
    const sizeMultiplier = sizeOffsets[selectedSize?.toUpperCase() || "M"] ?? 0;
    const baseMediumChest = 98;
    const baseMediumWaist = 88;

    const dbChest = productMeasurements.chest || productMeasurements.bust || chestWidthCirc;
    const dbWaist = productMeasurements.waist || waistWidthCirc;

    // Use specific size DB value if exists, else mathematically augment the medium defaults
    const normalizedProduct = {
      chest: dbChest ? dbChest : (baseMediumChest + sizeMultiplier),
      waist: dbWaist ? dbWaist : (baseMediumWaist + sizeMultiplier),
    };

    const fetchFitPrediction = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/predict-fit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_measurements: normalizedUser,
            product_measurements: normalizedProduct,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to load generic fit prediction");
        }

        const data = await response.json();
        setFitData(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFitPrediction();
  }, [userMeasurements, productMeasurements, selectedSize]);

  if (loading) {
    return (
      <Card className={`border-none ring-1 ring-primary/20 shadow-md ${className}`}>
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground animate-pulse">Running AI rule-based analysis...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !fitData) {
    return null; // Fail gracefully silently if no connection or error
  }

  const getStatusColor = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("perfect")) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (l.includes("tight")) return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    if (l.includes("loose")) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
  };

  const getStatusIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("perfect")) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (l.includes("tight")) return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    if (l.includes("loose")) return <AlertCircle className="w-4 h-4 text-amber-500" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  // Convert generic rule-based API 0-100 to progress bar value safely
  const scoreValue = Math.max(0, Math.min(100, fitData.score));
  
  // Decide overall gradient based on score
  let progressGradient = "bg-gradient-to-r from-emerald-400 to-emerald-600";
  if (scoreValue < 60) progressGradient = "bg-gradient-to-r from-rose-400 to-rose-600";
  else if (scoreValue < 85) progressGradient = "bg-gradient-to-r from-amber-400 to-amber-600";

  return (
    <Card className={`border-none ring-1 ring-primary/20 shadow-md overflow-hidden ${className}`}>
      <div className="p-3 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> AI Fit Analysis Panel
        </h3>
        <Badge variant="outline" className={`border ${getStatusColor(fitData.fit).replace("text-", "text-foreground ")}`}>
          {fitData.fit} Fit
        </Badge>
      </div>

      <CardContent className="p-5 space-y-6">
        {/* Score visualization */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="font-medium text-muted-foreground">Confidence Score</span>
            <span className="font-bold text-lg">{scoreValue}%</span>
          </div>
          <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden relative">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${progressGradient}`}
              style={{ width: `${scoreValue}%` }}
            />
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Measurement Breakdown</h4>
          
          {Object.entries(fitData.details).map(([key, label], idx) => {
            if (!label) return null;
            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getStatusColor(label).split(" ")[1]}`}>
                     {getStatusIcon(label)}
                  </div>
                  <span className="font-medium capitalize text-sm">{key}</span>
                </div>
                <Badge variant="secondary" className={`${getStatusColor(label)} rounded-full px-3`}>
                  {label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
