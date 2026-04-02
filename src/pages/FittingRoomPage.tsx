import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, ShoppingBag, Sparkles, Upload, ChevronDown, ChevronUp, Maximize2, ArrowLeft } from "lucide-react";
import AvatarViewer from "@/components/AvatarViewer";
import { AIAvatarGenerator } from "@/components/AIAvatarGenerator";
import { ImageUploadComponent } from "@/components/ImageUploadComponent";
import { GarmentGrid } from "@/components/GarmentGrid";
import { FitPredictionCard } from "@/components/FitPredictionCard";
import { FitAnalysisPanel } from "@/components/FitAnalysisPanel";
import { StyleRecommendationCard } from "@/components/StyleRecommendationCard";
import { ColorRecommendationCard } from "@/components/ColorRecommendationCard";
import { useFitPrediction } from "@/hooks/useFitPrediction";
import { Garment, api } from "@/utils/api";
import { toast } from "sonner";

const SKIN_TONES = [
  { name: "Porcelain", hsl: "35 90% 95%" },
  { name: "Fair", hsl: "30 75% 85%" },
  { name: "Light Olive", hsl: "50 40% 75%" },
  { name: "Medium", hsl: "25 55% 68%" },
  { name: "Warm Medium", hsl: "20 60% 62%" },
  { name: "Golden", hsl: "28 70% 55%" },
  { name: "Tan", hsl: "22 65% 50%" },
  { name: "Brown", hsl: "18 45% 42%" },
  { name: "Deep Brown", hsl: "15 50% 35%" },
  { name: "Dark Brown", hsl: "12 40% 28%" },
  { name: "Deep", hsl: "8 35% 20%" },
  { name: "Very Deep", hsl: "0 10% 15%" },
];

export default function FittingRoomPage() {
  const [activeTab, setActiveTab] = useState("ai");
  const [viewMode, setViewMode] = useState<"3d" | "ai">("3d");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [measurements, setMeasurements] = useState({
    height: 170,
    bust: 90,
    waist: 70,
    hips: 95
  });
  const [skinTone, setSkinTone] = useState(3);
  const [bodyType, setBodyType] = useState("average");

  const [category, setCategory] = useState("All");
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("M");

  const [styleRecs, setStyleRecs] = useState<any>(null);
  const [colorRecs, setColorRecs] = useState<any>(null);
  const [recsLoading, setRecsLoading] = useState(false);

  useEffect(() => {
    if (analysisData?.body_analysis) {
      setRecsLoading(true);
      Promise.all([
        api.getStyleRecommendations(analysisData.body_analysis.body_type),
        api.getColorRecommendations(analysisData.body_analysis.skin_tone_hsl)
      ])
        .then(([style, color]) => {
          setStyleRecs(style);
          setColorRecs(color);
          
        })
        .catch(console.error)
        .finally(() => setRecsLoading(false));
    }
  }, [analysisData]);

  // Utility function to dynamically derive body shape from manual dimensions
  const calculateBodyType = (m: any) => {
    const height = m.height || 170;
    const bust_ratio = (m.bust || 90) / height;
    const hip_ratio = (m.hips || 95) / height;

    if (hip_ratio > 0.68 || bust_ratio > 0.68) return "plussize";
    if (hip_ratio > 0.62 || bust_ratio > 0.62) return "curvy";
    if (hip_ratio < 0.54 && bust_ratio < 0.54) return "slim";
    return "average";
  };

  const combinedMeasurements = analysisData && activeTab === "ai" ? {
    ...analysisData.measurements,
    gender: analysisData.body_analysis?.gender,
    body_type: analysisData.body_analysis?.body_type,
    skin_tone_hsl: analysisData.body_analysis?.skin_tone_hsl
  } : {
    ...measurements,
    body_type: calculateBodyType(measurements),
    skin_tone_hsl: SKIN_TONES[skinTone].hsl
  };

  const { result: fitResults, loading: fitLoading } = useFitPrediction(
    selectedGarment,
    selectedSize,
    combinedMeasurements,
    analysisData?.measurement_id
  );

  useEffect(() => {
    if (fitLoading) {
      toast.loading("✨ Syncing AI parameters with garment size...", { id: "fit-calc" });
    } else if (selectedGarment && fitResults) {
      toast.success("🎯 AI analysis complete! Fit prediction updated.", { id: "fit-calc", duration: 3000 });
    }
  }, [fitLoading, selectedGarment?.id, selectedSize]);

  const handleAnalysisComplete = (data: any) => {
    console.log("Analysis Complete. Received Profile Data:", data.body_analysis);
    console.log("Received Measurements:", data.measurements);
    
    setAnalysisData(data);
    setUserProfile({
      body_type: data.body_analysis?.body_type,
      gender: data.body_analysis?.gender,
      measurements: data.measurements
    });

    if (data.measurements) {
      setMeasurements({
        height: data.measurements.height || 170,
        bust: data.measurements.bust || 90,
        waist: data.measurements.waist || 70,
        hips: data.measurements.hips || 95
      });
    }
    setIsAnalyzing(false);
  };

  const handleGarmentSelect = (garment: Garment, size: string) => {
    setSelectedGarment(garment);
    setSelectedSize(size);
  };

  const handleMeasurementChange = (key: string, value: number) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddToWishlist = async () => {
    if (!selectedGarment) {
      toast.error("Please select a garment first");
      return;
    }
    
    try {
      const wishlistData = {
        garment_id: selectedGarment.id,
        garment_name: selectedGarment.title || selectedGarment.name,
        garment_image: selectedGarment.image_url || selectedGarment.images?.[0] || "",
        size: selectedSize,
        fit_score: fitResults?.overall_fit_score || null,
        style_combination: styleRecs?.profile || null,
        recommendations: colorRecs || null
      };
      
      await api.addToWishlist(wishlistData);
      toast.success("Added to your wishlist!");
    } catch (error) {
      toast.error("Failed to add to wishlist");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Virtual <span className="text-gradient">Fitting Room</span>
          </h1>
          <p className="text-muted-foreground">Build your profile, view in 3D, and find the perfect fit.</p>
        </header>

        {/* 3-COLUMN MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:h-[calc(100vh-140px)] lg:min-h-[800px]">
          
          {/* LEFT PANEL: Controls & Profile */}
          <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-card border border-border/50 rounded-2xl p-1 shadow-sm">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="ai" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4"/> AI Setup
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    Manual
                  </TabsTrigger>
                </TabsList>
                
                <div className="p-4 mt-2 bg-card rounded-xl border border-border/50">
                  <TabsContent value="ai" className="m-0 space-y-4">
                     <ImageUploadComponent onAnalysisComplete={handleAnalysisComplete} />
                     {analysisData && (
                       <div className="mt-6">
                           <h3 className="font-semibold text-sm mb-3 flex flex-col gap-2">
                             <span>Analysis Results</span>
                             <div className="flex gap-2">
                               <Badge variant="secondary" className="text-xs font-normal capitalize">
                                 Detected Body Type: {analysisData.body_analysis?.body_type || "Unknown"}
                               </Badge>
                               <Badge variant="outline" className="text-xs font-normal capitalize">
                                 Detected Gender: {analysisData.body_analysis?.gender || "Unisex"}
                               </Badge>
                             </div>
                         </h3>
                         <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-muted/50 p-2 rounded-lg">
                              <span className="text-muted-foreground text-xs block">Height</span>
                              <span className="font-medium">{analysisData.measurements.height.toFixed(1)} cm</span>
                            </div>
                            <div className="bg-muted/50 p-2 rounded-lg">
                              <span className="text-muted-foreground text-xs block">Bust</span>
                              <span className="font-medium">{analysisData.measurements.bust.toFixed(1)} cm</span>
                            </div>
                            <div className="bg-muted/50 p-2 rounded-lg">
                              <span className="text-muted-foreground text-xs block">Waist</span>
                              <span className="font-medium">{analysisData.measurements.waist.toFixed(1)} cm</span>
                            </div>
                            <div className="bg-muted/50 p-2 rounded-lg">
                              <span className="text-muted-foreground text-xs block">Hips</span>
                              <span className="font-medium">{analysisData.measurements.hips.toFixed(1)} cm</span>
                            </div>
                         </div>
                         
                         {/* Styles & Colors Recommendations Pop-up */}
                         <div className="mt-6">
                           <Dialog>
                             <DialogTrigger asChild>
                               <Button 
                                 className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md shadow-fuchsia-500/20 border-0 rounded-xl h-12 text-sm font-semibold flex items-center justify-center gap-2 group transition-all"
                               >
                                 <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                 View Personalized Recommendations
                               </Button>
                             </DialogTrigger>
                             <DialogContent className="max-w-4xl bg-gradient-to-b from-background to-muted/20 border-border/50 shadow-2xl p-0 overflow-hidden max-h-[85vh] flex flex-col sm:rounded-2xl rounded-xl">
                               <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-background/80 backdrop-blur-sm z-10">
                                 <DialogTitle className="text-2xl flex items-center gap-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                                   <Sparkles className="w-6 h-6 text-fuchsia-500" />
                                   Your Personal Style Profile
                                 </DialogTitle>
                                 <DialogDescription className="text-[15px]">
                                   Based on your body analysis and skin tone, we've curated the perfect styles and colors just for you.
                                 </DialogDescription>
                               </DialogHeader>
                               
                               <div className="overflow-y-auto flex-1 p-6 px-4 md:px-6 custom-scrollbar bg-card/30">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                                   <div className="h-full">
                                     {(styleRecs || recsLoading) && <StyleRecommendationCard data={styleRecs?.profile} loading={recsLoading} />}
                                   </div>
                                   <div className="h-full">
                                     {(colorRecs || recsLoading) && <ColorRecommendationCard data={colorRecs} loading={recsLoading} />}
                                   </div>
                                 </div>
                               </div>
                             </DialogContent>
                           </Dialog>
                         </div>
                       </div>
                     )}
                  </TabsContent>
                  
                  <TabsContent value="manual" className="m-0 space-y-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Height (cm)</label>
                          <span className="text-sm text-muted-foreground">{measurements.height}</span>
                        </div>
                        <Slider 
                          value={[measurements.height]} 
                          min={140} max={210} step={1}
                          onValueChange={(v) => handleMeasurementChange("height", v[0])}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Bust (cm)</label>
                          <span className="text-sm text-muted-foreground">{measurements.bust}</span>
                        </div>
                        <Slider 
                          value={[measurements.bust]} 
                          min={70} max={130} step={1}
                          onValueChange={(v) => handleMeasurementChange("bust", v[0])}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Waist (cm)</label>
                          <span className="text-sm text-muted-foreground">{measurements.waist}</span>
                        </div>
                        <Slider 
                          value={[measurements.waist]} 
                          min={50} max={110} step={1}
                          onValueChange={(v) => handleMeasurementChange("waist", v[0])}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Hips (cm)</label>
                          <span className="text-sm text-muted-foreground">{measurements.hips}</span>
                        </div>
                        <Slider 
                          value={[measurements.hips]} 
                          min={70} max={130} step={1}
                          onValueChange={(v) => handleMeasurementChange("hips", v[0])}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
            
            {fitResults && selectedGarment && (
              <>
                {analysisData?.body_analysis?.gender === "female" && 
                 (selectedGarment.title || selectedGarment.name || "").toLowerCase().includes("men") && 
                 !(selectedGarment.title || selectedGarment.name || "").toLowerCase().includes("women") && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mt-6 flex items-start gap-3 shadow-sm">
                    <div className="bg-amber-100 p-1.5 rounded-full shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Gender Mismatch Warning</h4>
                      <p className="text-xs mt-0.5 opacity-90">You have selected a men's garment, but your profile indicates female. Fit predictions and 3D modeling might not accurately reflect the intended drape.</p>
                    </div>
                  </div>
                )}
                {analysisData?.body_analysis?.gender === "male" && 
                 ((selectedGarment.title || selectedGarment.name || "").toLowerCase().includes("women") || (selectedGarment.title || selectedGarment.name || "").toLowerCase().includes("girls")) && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mt-6 flex items-start gap-3 shadow-sm">
                    <div className="bg-amber-100 p-1.5 rounded-full shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Gender Mismatch Warning</h4>
                      <p className="text-xs mt-0.5 opacity-90">You have selected a women's garment, but your profile indicates male. Fit predictions and 3D modeling might not accurately reflect the intended drape.</p>
                    </div>
                  </div>
                )}
              <div className="bg-card border-none ring-1 ring-primary/20 rounded-2xl overflow-hidden shadow-md flex-shrink-0 mt-4 mb-4">
                 <div className="p-3 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
                   <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                     <Sparkles className="w-4 h-4"/> Fit Prediction
                   </h3>
                 </div>
                 <div className="p-0">
                   <FitPredictionCard garment={selectedGarment} size={selectedSize} fitData={fitResults} />
                 </div>
                 
                 <div className="p-0 border-t border-border/50">
                    <FitAnalysisPanel 
                      userMeasurements={combinedMeasurements} 
                      productMeasurements={selectedGarment.specifications?.sizes?.[selectedSize] || {}} 
                      selectedSize={selectedSize}
                    />
                 </div>
                 {(styleRecs || colorRecs) && (
                   <div className="p-4 bg-gradient-to-br from-indigo-500/5 to-purple-500/10 border-t border-border/50">
                     <Dialog>
                       <DialogTrigger asChild>
                         <Button 
                           className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md shadow-fuchsia-500/20 border-0 rounded-xl h-12 text-sm font-semibold flex items-center justify-center gap-2 group transition-all"
                         >
                           <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                           View Your Personalized Matches
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="max-w-4xl bg-gradient-to-b from-background to-muted/20 border-border/50 shadow-2xl p-0 overflow-hidden max-h-[85vh] flex flex-col sm:rounded-2xl rounded-xl">
                         <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-background/80 backdrop-blur-sm z-10">
                           <DialogTitle className="text-2xl flex items-center gap-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                             <Sparkles className="w-6 h-6 text-fuchsia-500" />
                             Your Personal Style Profile
                           </DialogTitle>
                           <DialogDescription className="text-[15px]">
                             Based on your body analysis and skin tone, we've curated the perfect styles and colors just for you.
                           </DialogDescription>
                         </DialogHeader>
                         
                         <div className="overflow-y-auto flex-1 p-6 px-4 md:px-6 custom-scrollbar bg-card/30">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                             <div className="h-full">
                               {(styleRecs || recsLoading) && <StyleRecommendationCard data={styleRecs?.profile} loading={recsLoading} />}
                             </div>
                             <div className="h-full">
                               {(colorRecs || recsLoading) && <ColorRecommendationCard data={colorRecs} loading={recsLoading} />}
                             </div>
                           </div>
                         </div>
                       </DialogContent>
                     </Dialog>
                   </div>
                 )}
              </div>
            </>
            )}
          </div>

          {/* CENTER PANEL: 3D Avatar or AI Preview */}
            <div className="lg:col-span-4 flex flex-col relative">
              
              {/* View Mode Toggle */}
              <div className="absolute top-4 left-0 right-0 flex justify-center z-20">
                <div className="bg-background/80 backdrop-blur-md p-1 rounded-full border border-border/50 shadow-sm flex items-center mt-2">
                  <button 
                    onClick={() => setViewMode("3d")}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${viewMode === "3d" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    3D Base Shape
                  </button>
                  <button 
                    onClick={() => setViewMode("ai")}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 flex items-center gap-1 ${viewMode === "ai" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Sparkles className="w-3 h-3" /> AI Realistic
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-gradient-to-b from-muted/30 to-muted/60 rounded-3xl border border-border/50 overflow-hidden relative shadow-inner min-h-[400px] lg:min-h-0 flex flex-col justify-center">
                {viewMode === "3d" ? (
                  <AvatarViewer
                      bodyType={combinedMeasurements.body_type || bodyType}                        gender={combinedMeasurements.gender}                      skinToneHsl={combinedMeasurements.skin_tone_hsl || SKIN_TONES[skinTone].hsl}
                      measurements={combinedMeasurements}
                      garment={selectedGarment}
                    />
                ) : (
                  <AIAvatarGenerator
                    measurements={measurements}
                    garment={selectedGarment}
                  />
                )}
                
                <div className="absolute bottom-6 left-0 right-0 w-full flex flex-wrap items-center justify-center gap-2 px-2 z-10">
                  {viewMode === "3d" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default" size="sm" className="rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium border border-indigo-400/50">
                          <Maximize2 className="w-4 h-4 mr-2" /> Enter Fitting Room
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen p-0 m-0 border-0 bg-[#0a0b10] rounded-none sm:rounded-none flex flex-col pt-12">
                        <div className="absolute top-4 left-6 z-50 flex flex-col gap-4">
                          <DialogClose asChild>
                            <Button variant="ghost" className="w-fit text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-2 px-3 py-6 rounded-xl group transition-all backdrop-blur-md border border-white/5">
                              <div className="bg-indigo-500/20 p-2 rounded-full group-hover:bg-indigo-500/40 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-indigo-300" />
                              </div>
                              <span className="font-semibold tracking-wide text-sm">Back to Studio</span>
                            </Button>
                          </DialogClose>
                          <div>
                            <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-fuchsia-400 flex items-center gap-2 tracking-wider">
                              <Sparkles className="w-6 h-6 text-fuchsia-400" />
                              IMMERSIVE FITTING ROOM
                            </h2>
                            <div className="mt-2 flex gap-2">
                              {selectedGarment && (
                                <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30">
                                  {selectedGarment.title}
                                </Badge>
                              )}
                              <Badge className="bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30">
                                {selectedSize}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 w-full h-full relative relative">
                          <AvatarViewer
                      bodyType={combinedMeasurements.body_type || bodyType}                        gender={combinedMeasurements.gender}                      skinToneHsl={combinedMeasurements.skin_tone_hsl || SKIN_TONES[skinTone].hsl}
                      measurements={combinedMeasurements}
                      garment={selectedGarment}
                    />
                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1a1b26]/80 backdrop-blur border border-indigo-500/30 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <Button variant="ghost" className="text-indigo-200 hover:text-white hover:bg-indigo-500/30 flex-col h-auto py-2 gap-1 min-w-[80px]">
                              <span className="text-xs opacity-70">ROTATE</span>
                              <span className="font-bold">DRAG</span>
                            </Button>
                            <div className="w-[1px] h-8 bg-indigo-500/30" />
                            <Button variant="ghost" className="text-indigo-200 hover:text-white hover:bg-indigo-500/30 flex-col h-auto py-2 gap-1 min-w-[80px]">
                              <span className="text-xs opacity-70">ZOOM</span>
                              <span className="font-bold">SCROLL</span>
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button variant="secondary" size="sm" className="rounded-full shadow-sm bg-background/80 backdrop-blur-md hover:bg-background">
                    Reset View
                  </Button>
                  <Button variant="secondary" size="sm" className="rounded-full shadow-sm bg-background/80 backdrop-blur-md hover:bg-background">
                    <Share2 className="w-4 h-4 mr-2" /> Share Look
                  </Button>
                  <Button 
                    onClick={handleAddToWishlist}
                    variant="outline" 
                    size="sm" 
                    className="rounded-full shadow-sm bg-background/80 backdrop-blur-md hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-colors"
                  >
                    <Heart className="w-4 h-4 mr-2" /> Save to Wishlist
                  </Button>
                </div>
            </div>
          </div>

          {/* RIGHT PANEL: Product Catalog */}
          <div className="lg:col-span-5 flex flex-col overflow-hidden">
            <div className="bg-card border border-border/50 rounded-2xl flex flex-col h-full overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border/50 bg-muted/20 backdrop-blur-sm z-10">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-semibold flex items-center gap-2">
                     <ShoppingBag className="w-5 h-5" /> Collection
                   </h2>
                   <Badge variant="outline" className="px-3 py-1 font-normal">
                     {selectedGarment ? "Fitting ready" : "Select item"}
                   </Badge>
                 </div>
                 
                 {/* Filters */}
                 <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-2 custom-scrollbar">
                   {["All", "Tops", "Bottoms", "Dresses", "Outerwear"].map((cat) => (
                     <button
                       key={cat}
                       onClick={() => setCategory(cat)}
                       className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                         category === cat 
                           ? "bg-primary text-primary-foreground shadow-sm"
                           : "bg-muted hover:bg-muted/80 text-muted-foreground"
                       }`}
                     >
                       {cat}
                     </button>
                   ))}
                 </div>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                 <GarmentGrid 
                   measurementId={analysisData?.measurement_id}
                   onSelectGarment={handleGarmentSelect}
                   categoryFilter={category !== "All" ? category.toLowerCase() : undefined}
                 />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
