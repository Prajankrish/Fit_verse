import React, { useState, createContext, useContext, useEffect } from 'react';
import { AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';

// --- STATE MANAGEMENT ---
interface BodyData { 
  chest: number; 
  waist: number; 
  hips: number; 
  height: number;
  body_type?: string;
}
interface GarmentData { 
  id: string; 
  name: string; 
  image: string; 
  garment_chest: number; 
  garment_waist: number; 
  garment_length: number; 
}

interface SizeResult {
  margin: number;
  ratio: number;
  score: number;
  width_fit: string;
  width_score: number;
  length_fit: string;
  length_score: number;
}

interface FitResult { 
  width_fit: string; 
  length_fit: string; 
  width_score: number; 
  length_score: number; 
  confidence: number;
  score: number;
  selected_size: string;
  recommended_size: string; 
  recommendation: string;
  explanation: string;
  all_sizes: Record<string, SizeResult>;
}

interface FitContextType {
  bodyData: BodyData | null;
  setBodyData: (data: BodyData) => void;
  selectedProduct: GarmentData | null;
  setSelectedProduct: (product: GarmentData | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const FitContext = createContext<FitContextType | null>(null);

export const FitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bodyData, setBodyData] = useState<BodyData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<GarmentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <FitContext.Provider value={{ bodyData, setBodyData, selectedProduct, setSelectedProduct, isModalOpen, setIsModalOpen }}>
      {children}
    </FitContext.Provider>
  );
};

// --- ADVANCED FIT ENGINE ---
class AdvancedFitEngine {
  /**
   * Classify body type based on measurements
   */
  static classifyBodyType(bodyData: BodyData): 'plus_size' | 'slim' | 'average' {
    const chest = bodyData.chest || 90;
    const waist = bodyData.waist || 75;
    const hips = bodyData.hips || 95;
    const height = bodyData.height || 170;
    const bodyTypeStr = (bodyData.body_type || '').toLowerCase();

    // Explicit type override
    if (bodyTypeStr.includes('plus') || bodyTypeStr.includes('curvy')) return 'plus_size';
    if (bodyTypeStr.includes('slim') || bodyTypeStr.includes('petite') || bodyTypeStr.includes('athletic')) return 'slim';

    // Chest-based classification
    const chestToHeightRatio = chest / height;
    if (chestToHeightRatio > 0.56) return 'plus_size';
    if (chestToHeightRatio < 0.48) return 'slim';
    
    // Waist-hip analysis for plus size
    const waistHipRatio = waist / hips;
    if (chest > 100 && waistHipRatio > 0.7) return 'plus_size';
    
    return 'average';
  }

  /**
   * Smart size recommendation based on body classification
   */
  static recommendSmartSize(
    bodyType: 'plus_size' | 'slim' | 'average',
    allSizes: Record<string, SizeResult>
  ): string {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
    const scores = Object.entries(allSizes)
      .sort((a, b) => b[1].score - a[1].score);

    // Plus size: prefer XL or 2XL
    if (bodyType === 'plus_size') {
      const xlScore = allSizes['XL']?.score || -999;
      const xxlScore = allSizes['2XL']?.score || -999;
      if (xxlScore > 50) return '2XL';
      if (xlScore > 50) return 'XL';
      if (xlScore > 30) return 'XL';
      // Fall back to best available
      const xlOrLarger = scores.filter(([s]) => s === 'L' || s === 'XL' || s === '2XL');
      return xlOrLarger.length > 0 ? xlOrLarger[0][0] : scores[0][0];
    }

    // Slim: prefer S or M
    if (bodyType === 'slim') {
      const sScore = allSizes['S']?.score || -999;
      const mScore = allSizes['M']?.score || -999;
      if (sScore > 50) return 'S';
      if (mScore > 50) return 'M';
      if (sScore > 30) return 'S';
      // Fall back to best available under M
      const sOrSmaller = scores.filter(([s]) => s === 'XS' || s === 'S' || s === 'M');
      return sOrSmaller.length > 0 ? sOrSmaller[0][0] : scores[0][0];
    }

    // Average: prefer M or L
    if (bodyType === 'average') {
      const mScore = allSizes['M']?.score || -999;
      const lScore = allSizes['L']?.score || -999;
      if (Math.abs(mScore - lScore) < 5) {
        return mScore >= lScore ? 'M' : 'L';
      }
      return mScore > lScore ? 'M' : 'L';
    }

    return scores[0][0];
  }

  /**
   * Calculate combined confidence: width + length feedback
   */
  static calculateCombinedConfidence(sizeData: SizeResult, allSizes: Record<string, SizeResult>): number {
    // Start with width and length scores (0-1)
    const widthScore = Math.min(1, sizeData.width_score || 0.5);
    const lengthScore = Math.min(1, sizeData.length_score || 0.5);

    // Combined score (average)
    let combinedScore = (widthScore + lengthScore) / 2;

    // Penalty if width is not perfect
    if (sizeData.width_fit === 'Tight') combinedScore -= 0.15;
    if (sizeData.width_fit === 'Loose') combinedScore -= 0.1;

    // Penalty if length is not perfect
    if (sizeData.length_fit === 'Short') combinedScore -= 0.15;
    if (sizeData.length_fit === 'Long') combinedScore -= 0.1;

    // Boost if both are perfect
    if (sizeData.width_fit === 'Perfect' && sizeData.length_fit === 'Perfect') {
      combinedScore = Math.min(1, combinedScore + 0.2);
    }

    // Compare to other sizes
    const myScore = sizeData.score;
    const scores = Object.values(allSizes).map(s => s.score);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // If significantly below average, lower confidence
    if (myScore < avgScore - 10) {
      combinedScore -= 0.2;
    }

    // If best size, boost confidence
    if (myScore === maxScore && myScore > 70) {
      combinedScore = Math.min(1, combinedScore + 0.15);
    }

    return Math.max(0.2, Math.min(1, combinedScore));
  }

  /**
   * Determine if a size is recommended or NOT RECOMMENDED
   */
  static getRecommendationStatus(confidence: number): 'recommended' | 'not_recommended' {
    return confidence >= 0.5 ? 'recommended' : 'not_recommended';
  }

  /**
   * Generate intelligentinsight about fit
   */
  static generateInsight(
    size: string,
    sizeData: SizeResult,
    bodyData: BodyData,
    confidence: number,
    bodyType: string
  ): string {
    const chest = bodyData.chest || 90;
    const height = bodyData.height || 170;
    const margin = sizeData.margin;
    const ratio = sizeData.ratio;

    const confidenceLevel = confidence > 0.8 ? 'excellent' : confidence > 0.6 ? 'good' : 'fair';
    const bodyTypeLabel = bodyType === 'plus_size' ? 'curvy' : bodyType === 'slim' ? 'slim' : 'average';

    if (sizeData.width_fit === 'Perfect' && sizeData.length_fit === 'Perfect') {
      return `Size ${size} is your perfect match – ${sizeData.width_fit.toLowerCase()} width fit and ${sizeData.length_fit.toLowerCase()} length for your ${bodyTypeLabel} build.`;
    }

    if (sizeData.width_fit === 'Perfect') {
      return `Excellent width fit (${margin.toFixed(1)}cm ease). Length is ${sizeData.length_fit.toLowerCase()} for your ${height}cm height.`;
    }

    if (sizeData.length_fit === 'Perfect') {
      return `Perfect length for your height. Width is ${sizeData.width_fit.toLowerCase()} – suit it with layering if needed.`;
    }

    if (sizeData.width_fit === 'Tight' && sizeData.length_fit === 'Perfect') {
      return `Snug fit ideal for a tailored look. Length is perfect for your frame.`;
    }

    if (sizeData.width_fit === 'Loose' && sizeData.length_fit === 'Perfect') {
      return `Relaxed, oversized aesthetic with proportional length for your height.`;
    }

    return `Size ${size} offers ${sizeData.width_fit.toLowerCase()} width and ${sizeData.length_fit.toLowerCase()} length fit.`;
  }
}

// --- FIT MODAL COMPONENT ---
export const FitModal: React.FC = () => {
  const ctx = useContext(FitContext);
  if (!ctx) return null;
  
  const { bodyData, selectedProduct, isModalOpen, setIsModalOpen } = ctx;
  
  const [fitResult, setFitResult] = useState<FitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [recommendedSize, setRecommendedSize] = useState("M");
  const [aiInsight, setAiInsight] = useState("");
  const [improvedConfidence, setImprovedConfidence] = useState(0.69);
  const [bodyClassification, setBodyClassification] = useState<'plus_size' | 'slim' | 'average'>('average');
  const [immersiveMode, setImmersiveMode] = useState(false);
  
  useEffect(() => {
    const fetchPrediction = async () => {
      if (!isModalOpen || !selectedProduct || !bodyData) return;
      
      setLoading(true);
      setError(null);
      setFitResult(null);

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/predict-fit-advanced`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: bodyData,
            garment: selectedProduct
          })
        });

        if (!response.ok) throw new Error("API integration failed");
        
        const data = await response.json();
        
        // Classify body type
        const classification = AdvancedFitEngine.classifyBodyType(bodyData);
        setBodyClassification(classification);

        // Get smart size recommendation
        const smartSize = AdvancedFitEngine.recommendSmartSize(
          classification,
          data.all_sizes
        );
        
        setRecommendedSize(smartSize);
        setSelectedSize(smartSize);

        // Calculate combined confidence
        const sizeData = data.all_sizes[smartSize];
        const confidence = AdvancedFitEngine.calculateCombinedConfidence(
          sizeData,
          data.all_sizes
        );
        setImprovedConfidence(confidence);

        // Generate intelligent insight
        const insight = AdvancedFitEngine.generateInsight(
          smartSize,
          sizeData,
          bodyData,
          confidence,
          classification
        );
        setAiInsight(insight);

        setFitResult(data);
      } catch (err: any) {
        setError(err.message || "Failed to analyze fit. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [isModalOpen, selectedProduct, bodyData]);

  if (!isModalOpen) return null;

  const getBarColor = (fit: string) => {
    if (fit === "Tight" || fit === "Short") return "bg-red-500";
    if (fit === "Loose" || fit === "Long") return "bg-yellow-500";
    return "bg-green-500";
  };

  const getFitTypeEmoji = (fit: string) => {
    if (fit === "Perfect") return "✨";
    if (fit === "Tight") return "🤏";
    if (fit === "Loose") return "🌬️";
    return "📏";
  };

  const getRecommendationStatus = (confidence: number) =>
    AdvancedFitEngine.getRecommendationStatus(confidence);

  const currentSizeData = fitResult && fitResult.all_sizes ? fitResult.all_sizes[selectedSize] : null;
  const recommendationStatus = getRecommendationStatus(improvedConfidence);
  const statusColor = recommendationStatus === 'recommended' ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200';
  const statusText = recommendationStatus === 'recommended' ? '✅ Recommended' : '⚠️ Not Recommended';
  const statusTextColor = recommendationStatus === 'recommended' ? 'text-emerald-900' : 'text-orange-900';

  if (immersiveMode) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex">
        {/* Left: 3D Avatar */}
        <div className="w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-xl font-bold mb-2">Your Avatar</p>
            <p className="text-sm text-gray-400">3D view will load here</p>
            <button
              onClick={() => setImmersiveMode(false)}
              className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg"
            >
              Exit Immersive
            </button>
          </div>
        </div>

        {/* Right: Fit Analysis Panel */}
        <div className="w-1/2 bg-white overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-3xl font-bold text-gray-900">Immersive Fit Analysis</h2>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {fitResult && (
            <>
              {/* AI Strip */}
              <div className={`border rounded-xl p-5 ${statusColor}`}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🤖</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg text-gray-900">Size {selectedSize}</h3>
                      <span className={`px-3 py-1 rounded-full font-bold text-sm ${statusTextColor}`}>{statusText}</span>
                    </div>
                    <p className="text-gray-700 mb-3">{aiInsight}</p>
                    <div className="flex gap-3 text-sm font-semibold">
                      <div>{getFitTypeEmoji(currentSizeData?.width_fit || 'Perfect')} {currentSizeData?.width_fit}</div>
                      <div>•</div>
                      <div>{getFitTypeEmoji(currentSizeData?.length_fit || 'Perfect')} {currentSizeData?.length_fit}</div>
                      <div>•</div>
                      <div>🎯 {(improvedConfidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase block mb-3">Choose Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {["S", "M", "L", "XL"].map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 rounded-lg font-semibold transition-all border-2 ${
                        selectedSize === size 
                          ? "bg-indigo-600 text-white border-indigo-700" 
                          : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs font-bold text-gray-600 uppercase mb-2">Width</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{currentSizeData?.width_fit}</p>
                  <div className="w-full bg-gray-300 rounded h-2">
                    <div 
                      className={`h-2 rounded ${getBarColor(currentSizeData?.width_fit || '')}`} 
                      style={{ width: `${(currentSizeData?.width_score || 0.5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs font-bold text-gray-600 uppercase mb-2">Length</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{currentSizeData?.length_fit}</p>
                  <div className="w-full bg-gray-300 rounded h-2">
                    <div 
                      className={`h-2 rounded ${getBarColor(currentSizeData?.length_fit || '')}`} 
                      style={{ width: `${(currentSizeData?.length_score || 0.5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Confidence */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm font-bold text-indigo-700 mb-2">AI Confidence</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <p className="text-4xl font-bold text-indigo-700">{(improvedConfidence * 100).toFixed(0)}%</p>
                  <p className="text-sm text-indigo-600">
                    {improvedConfidence > 0.8 ? 'Excellent fit' : improvedConfidence > 0.6 ? 'Good fit' : 'Fair fit'}
                  </p>
                </div>
                <div className="w-full bg-indigo-200 rounded h-3">
                  <div 
                    className="h-3 bg-indigo-600 rounded" 
                    style={{ width: `${improvedConfidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-5xl shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-3xl font-bold text-gray-900">AI Fit Analysis</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setImmersiveMode(true)} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm"
            >
              🎯 Immersive Mode
            </button>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        ) : loading || !fitResult ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Analyzing your perfect fit...</p>
          </div>
        ) : (
          <>
            {/* RECOMMENDATION STATUS */}
            <div className={`border rounded-xl p-5 ${statusColor}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">{statusText}</h3>
                <span className="text-3xl">{recommendationStatus === 'recommended' ? '✅' : '⚠️'}</span>
              </div>
              <p className="text-sm text-gray-700">
                {recommendationStatus === 'recommended' 
                  ? `We're ${(improvedConfidence * 100).toFixed(0)}% confident Size ${selectedSize} is perfect for you.`
                  : `Size ${selectedSize} is not ideal. Consider Size ${recommendedSize} for better fit.`}
              </p>
            </div>

            {/* AI STYLIST STRIP */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🤖</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">AI Stylist Insight</h3>
                  <p className="text-indigo-100 mb-3">{aiInsight}</p>
                  <div className="flex gap-4 text-sm font-semibold flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl">{getFitTypeEmoji(currentSizeData?.width_fit || 'Perfect')}</span>
                      <span>{currentSizeData?.width_fit || 'Perfect'} Width</span>
                    </div>
                    <div>•</div>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl">{getFitTypeEmoji(currentSizeData?.length_fit || 'Perfect')}</span>
                      <span>{currentSizeData?.length_fit || 'Perfect'} Length</span>
                    </div>
                    <div>•</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{(improvedConfidence * 100).toFixed(0)}% Confident</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT: Product Image */}
              <div className="flex flex-col gap-4">
                <img src={selectedProduct?.image || "/placeholder.jpg"} alt={selectedProduct?.name} className="w-full h-96 object-cover rounded-xl border-2 border-gray-200" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedProduct?.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{bodyClassification === 'plus_size' ? 'Curvy' : bodyClassification === 'slim' ? 'Slim' : 'Average'} fit optimized</p>
                </div>
              </div>

              {/* MIDDLE: Size Selector */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 uppercase block mb-3">Choose Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["S", "M", "L", "XL"].map(size => {
                      const sizeData = fitResult.all_sizes[size];
                      const sizeConfidence = AdvancedFitEngine.calculateCombinedConfidence(sizeData, fitResult.all_sizes);
                      const isRecommended = sizeConfidence >= 0.5;
                      
                      return (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`p-3 rounded-lg font-semibold transition-all border-2 relative ${
                            selectedSize === size 
                              ? "bg-indigo-600 text-white border-indigo-700 shadow-lg" 
                              : size === recommendedSize
                              ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                              : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
                          }`}
                        >
                          <div>{size}</div>
                          <div className="text-xs mt-1 opacity-70">
                            {sizeData?.score.toFixed(0) || '-'}
                          </div>
                          {!isRecommended && size !== selectedSize && (
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">!</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedSize !== recommendedSize && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-emerald-900 mb-1">✨ Better Option</p>
                    <p className="text-xs text-emerald-800">Size {recommendedSize} fits your {bodyClassification === 'plus_size' ? 'curvy' : bodyClassification === 'slim' ? 'slim' : 'average'} build better</p>
                  </div>
                )}
              </div>

              {/* RIGHT: Fit Metrics */}
              <div className="flex flex-col gap-4">
                
                {/* Width Fit */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Width Fit</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{currentSizeData?.width_fit || 'Perfect'}</p>
                    </div>
                    <span className="text-3xl">{getFitTypeEmoji(currentSizeData?.width_fit || 'Perfect')}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all ${getBarColor(currentSizeData?.width_fit || 'Perfect')}`} 
                      style={{ width: `${Math.max(0, Math.min(100, (currentSizeData?.width_score || 0.5) * 100))}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{((currentSizeData?.width_score || 0.5) * 100).toFixed(0)}% Match</p>
                </div>

                {/* Length Fit */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Length Fit</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{currentSizeData?.length_fit || 'Perfect'}</p>
                    </div>
                    <span className="text-3xl">{getFitTypeEmoji(currentSizeData?.length_fit || 'Perfect')}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all ${getBarColor(currentSizeData?.length_fit || 'Perfect')}`} 
                      style={{ width: `${Math.max(0, Math.min(100, (currentSizeData?.length_score || 0.5) * 100))}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{((currentSizeData?.length_score || 0.5) * 100).toFixed(0)}% Match</p>
                </div>

                {/* Confidence Meter - UPDATED */}
                <div className={`border rounded-xl p-4 ${statusColor}`}>
                  <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Confidence Score</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900">{(improvedConfidence * 100).toFixed(0)}%</p>
                    <p className="text-xs text-gray-600">
                      {improvedConfidence > 0.8 ? 'Excellent' : improvedConfidence > 0.6 ? 'Good' : improvedConfidence > 0.5 ? 'Fair' : 'Low'}
                    </p>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 mt-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${improvedConfidence > 0.5 ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                      style={{ width: `${improvedConfidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* WHY THIS SIZE */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Why Size {selectedSize}?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex gap-3">
                  <div className="text-2xl">👕</div>
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Width</p>
                    <p className="text-xs text-blue-800 mt-1">
                      {currentSizeData?.margin === undefined 
                        ? "Optimal ease" 
                        : currentSizeData.margin < -3 
                        ? `Tight (${Math.abs(currentSizeData.margin).toFixed(1)}cm compression)`
                        : currentSizeData.margin > 6 
                        ? `Relaxed (${currentSizeData.margin.toFixed(1)}cm ease)`
                        : `Perfect (${currentSizeData.margin.toFixed(1)}cm ease)`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">🤸</div>
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Movement</p>
                    <p className="text-xs text-blue-800 mt-1">
                      {currentSizeData?.width_score && currentSizeData.width_score > 0.6
                        ? "Excellent mobility and flexibility"
                        : currentSizeData?.width_fit === 'Tight'
                        ? "Fitted, allows defined silhouette"
                        : "Comfortable range of motion"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">📏</div>
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Length</p>
                    <p className="text-xs text-blue-800 mt-1">
                      {currentSizeData?.length_fit === "Perfect"
                        ? `Proportioned for ${bodyData?.height || 170}cm height`
                        : currentSizeData?.length_fit === "Short"
                        ? "Modern cropped leg/length"
                        : "Extended coverage for tall frame"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SIZE COMPARISON TABLE */}
            <details className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <summary className="font-bold text-gray-900 cursor-pointer hover:text-indigo-600">
                📊 View All Sizes Comparison
              </summary>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 px-2 font-bold">Size</th>
                      <th className="text-left py-2 px-2 font-bold">Score</th>
                      <th className="text-left py-2 px-2 font-bold">Width</th>
                      <th className="text-left py-2 px-2 font-bold">Length</th>
                      <th className="text-left py-2 px-2 font-bold">Confidence</th>
                      <th className="text-left py-2 px-2 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fitResult.all_sizes && Object.entries(fitResult.all_sizes).map(([size, data]) => {
                      const conf = AdvancedFitEngine.calculateCombinedConfidence(data, fitResult.all_sizes);
                      const status = AdvancedFitEngine.getRecommendationStatus(conf);
                      return (
                        <tr key={size} className={`border-b border-gray-200 ${selectedSize === size ? "bg-indigo-100" : ""}`}>
                          <td className="py-2 px-2 font-semibold">{size}</td>
                          <td className="py-2 px-2">{data.score.toFixed(0)}</td>
                          <td className="py-2 px-2">{data.width_fit}</td>
                          <td className="py-2 px-2">{data.length_fit}</td>
                          <td className="py-2 px-2 font-bold">{(conf * 100).toFixed(0)}%</td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              status === 'recommended' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {status === 'recommended' ? '✓ OK' : '✗ Not OK'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t flex justify-end gap-3">
          <button 
            onClick={() => setIsModalOpen(false)} 
            className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};