import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Ruler, ArrowRight, Sparkles, Activity, ShieldCheck, 
  Camera, User, CheckCircle2, ChevronRight, Lock
} from "lucide-react";
import { useFittingRoom } from "@/contexts/FittingRoomContext";

const SIZE_CHART = {
  headers: ["Size", "Bust (cm)", "Waist (cm)", "Hips (cm)", "US", "UK", "EU"],
  rows: [
    ["XS", "78-82", "60-64", "84-88", "0-2", "4-6", "32-34"],
    ["S", "83-87", "65-69", "89-93", "4-6", "8-10", "36-38"],
    ["M", "88-92", "70-74", "94-98", "8-10", "12-14", "40-42"],
    ["L", "93-99", "75-81", "99-105", "12-14", "16-18", "44-46"],
    ["XL", "100-108", "82-90", "106-114", "16-18", "20-22", "48-50"],
    ["2XL", "109-118", "91-100", "115-124", "20-22", "24-26", "52-54"],
    ["3XL", "119-128", "101-110", "125-134", "24-26", "28-30", "56-58"],
    ["4XL", "129-138", "111-120", "135-144", "28-30", "32-34", "60-62"],
    ["5XL", "139-148", "121-130", "145-154", "32-34", "36-38", "64-66"],
  ],
};

export default function SizeGuidePage() {
  const { bodyType, gender } = useFittingRoom();
  const navigate = useNavigate();

  // Calculator State
  const [measurements, setMeasurements] = useState({
    height: "",
    chest: "",
    waist: "",
    hips: ""
  });
  
  const [calculationResult, setCalculationResult] = useState<{
    size: string;
    fitType: string;
    confidence: number;
  } | null>(null);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [guideGender, setGuideGender] = useState<'female' | 'male'>('female');

  // Parse body type into an estimated size just for demo purposes if measurements are empty
  const profileEstimatedSize = bodyType ? (bodyType.toLowerCase() === "hourglass" ? "M" : bodyType.toLowerCase() === "rectangle" ? "L" : bodyType.toLowerCase() === "inverted triangle" ? "M" : "S") : null;

  const handleCalculate = () => {
    setIsCalculating(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      // Very basic mock logic for demo
      const bustNum = parseFloat(measurements.chest) || 0;
      let foundSize = "M"; // default
      let maxScore = 0;
      
      // Find row where bust roughly matches
      if (bustNum > 0) {
        for (const row of SIZE_CHART.rows) {
          const [minBust, maxBust] = row[1].split("-").map(Number);
          if (bustNum >= minBust && bustNum <= maxBust) {
            foundSize = row[0];
            maxScore = 95;
            break;
          } else if (bustNum > maxBust) {
             foundSize = row[0]; // will keep going up
          }
        }
      } else {
        foundSize = profileEstimatedSize || "M";
        maxScore = 80;
      }
      
      if (!maxScore) maxScore = 85;

      const fitType = (Math.random() > 0.5) ? "Regular Fit" : "Relaxed Fit";
      
      setCalculationResult({
        size: foundSize,
        fitType,
        confidence: Math.min(99, maxScore + Math.floor(Math.random() * 5))
      });
      setIsCalculating(false);
    }, 1200);
  };

  const highlightSize = calculationResult?.size || profileEstimatedSize;

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* ===== HERO SECTION ===== */}
      <div className="bg-white border-b shadow-sm relative overflow-hidden">
        {/* Abstract Background Ornaments */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none" />
        
        <div className="container mx-auto px-4 py-12 lg:py-16 relative z-10 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" /> AI Size Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-4">
            Find Your <span className="bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">Perfect Fit</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Stop guessing your size. Our AI intelligence assistant analyzes your exact measurements to recommend the ideal fit across international standards.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-10 max-w-5xl space-y-8 animate-fade-in-up">
        
        {/* ===== PERSONAL PROFILE SECTION ===== */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center shadow-lg text-white shrink-0">
                {bodyType ? <User className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Size Profile</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {bodyType ? (
                    <>
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Active</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span className="font-semibold text-foreground capitalize">{bodyType} Body Type</span>
                      {gender && (
                        <>
                           <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                           <span className="capitalize">{gender}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-orange-400" /> No Profile Detected</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span>Upload a photo for instant analysis</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="shrink-0 flex gap-3">
              {bodyType ? (
                <div className="bg-muted px-4 py-3 rounded-2xl text-center border border-border/50">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">Est. Size</p>
                  <p className="text-2xl font-black text-primary leading-none">{profileEstimatedSize || "M"}</p>
                </div>
              ) : (
                <Button className="rounded-xl shadow-md gap-2 font-semibold h-12 px-6" onClick={() => navigate('/')}>
                   <Camera className="w-4 h-4" /> Scan Body Type
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ===== INTERACTIVE SIZE CALCULATOR ===== */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-border/50 shadow-sm relative z-20">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <Ruler className="w-5 h-5 text-primary" /> Smart Calculator
               </h3>
               
               <div className="space-y-4 mb-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Height (cm)</Label>
                      <Input 
                        id="height" 
                        type="number" 
                        placeholder="e.g. 170" 
                        className="bg-muted/30 border-0 shadow-inner h-12 text-lg font-medium"
                        value={measurements.height}
                        onChange={(e) => setMeasurements(p => ({...p, height: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chest" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chest/Bust (cm)</Label>
                      <Input 
                        id="chest" 
                        type="number" 
                        placeholder="e.g. 90" 
                        className="bg-muted/30 border-0 shadow-inner h-12 text-lg font-medium"
                        value={measurements.chest}
                        onChange={(e) => setMeasurements(p => ({...p, chest: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waist" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Waist (cm)</Label>
                      <Input 
                        id="waist" 
                        type="number" 
                        placeholder="e.g. 72" 
                        className="bg-muted/30 border-0 shadow-inner h-12 text-lg font-medium"
                        value={measurements.waist}
                        onChange={(e) => setMeasurements(p => ({...p, waist: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hips" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hips (cm)</Label>
                      <Input 
                        id="hips" 
                        type="number" 
                        placeholder="e.g. 96" 
                        className="bg-muted/30 border-0 shadow-inner h-12 text-lg font-medium"
                        value={measurements.hips}
                        onChange={(e) => setMeasurements(p => ({...p, hips: e.target.value}))}
                      />
                    </div>
                 </div>
               </div>

               <Button 
                 className={`w-full h-14 rounded-2xl text-base font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${isCalculating ? 'bg-muted text-muted-foreground cursor-wait' : 'bg-gradient-to-r from-primary to-teal-500 text-white hover:shadow-lg hover:-translate-y-0.5 hover:opacity-90'}`}
                 onClick={handleCalculate}
                 disabled={isCalculating || (!measurements.chest && !measurements.waist && !measurements.hips)}
               >
                 {isCalculating ? (
                    <><Activity className="w-5 h-5 animate-pulse" /> Processing Measurements...</>
                 ) : (
                    <><Sparkles className="w-5 h-5" /> Get My Exact Size</>
                 )}
               </Button>
               
               {/* Result Card */}
               {calculationResult && !isCalculating && (
                 <div className="mt-6 p-5 bg-gradient-to-br from-primary/10 to-teal-500/10 border border-primary/20 rounded-2xl animate-in slide-in-from-bottom-4 duration-500 fade-in">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">AI Recommendation</p>
                       <h4 className="text-3xl font-black text-gray-900 leading-none">{calculationResult.size}</h4>
                     </div>
                     <Badge className="bg-white text-green-600 border border-green-500/20 shadow-sm font-bold flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> {calculationResult.confidence}% Match
                     </Badge>
                   </div>
                   <div className="flex items-center gap-3 mt-4 pt-4 border-t border-primary/10">
                     <span className="text-sm font-medium text-muted-foreground flex-1">Fit Style: <strong>{calculationResult.fitType}</strong></span>
                     <Button variant="link" size="sm" className="h-auto p-0 text-primary font-bold" onClick={() => document.getElementById('size-table')?.scrollIntoView({behavior: 'smooth'})}>
                       View details <ChevronRight className="w-3 h-3 ml-0.5" />
                     </Button>
                   </div>
                 </div>
               )}
            </div>

            {/* ===== VISUAL MEASUREMENT GUIDE ===== */}
            <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm relative overflow-hidden group">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold">How to Measure</h3>
                 <div className="flex items-center p-1 bg-muted rounded-full">
                    <button 
                      onClick={() => setGuideGender('female')} 
                      className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${guideGender === 'female' ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Female
                    </button>
                    <button 
                      onClick={() => setGuideGender('male')} 
                      className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${guideGender === 'male' ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Male
                    </button>
                 </div>
               </div>

               <div className="relative aspect-[3/4] bg-muted/10 rounded-2xl overflow-hidden mb-6 border border-border/30 flex items-center justify-center">
                 {/* Human Body Image */}
                 <img 
                   src={
                     guideGender === 'female' 
                       ? "https://images.unsplash.com/photo-1605763240000-7e93b172d754?q=80&w=400&auto=format&fit=crop"
                       : "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=400&auto=format&fit=crop"
                   } 
                   alt={`${guideGender} body measurement guide`}
                   className="h-full w-auto object-cover object-top opacity-90 transition-opacity duration-500 rounded-xl"
                 />
                 
                 {/* Measurement Overlays */}
                 {/* Chest Line (Red) */}
                 <div className="absolute top-[28%] left-0 w-full flex items-center justify-center group/chest cursor-crosshair z-10 hover:z-20">
                   <div className="relative flex items-center w-full max-w-[200px] justify-center">
                     <div className="w-[80%] h-[2px] bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] relative transition-all duration-300 group-hover/chest:scale-x-110 group-hover/chest:bg-red-500 group-hover/chest:h-[3px]">
                       <div className="absolute -left-6 md:-left-12 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                         <span className="bg-white border-2 border-red-500/20 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm transition-all group-hover/chest:border-red-500 group-hover/chest:scale-110">Chest</span>
                       </div>
                       {/* Tooltip */}
                       <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-900 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover/chest:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover/chest:translate-y-0">
                         Measure under arms around the fullest part
                         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Waist Line (Green) */}
                 <div className="absolute top-[48%] left-0 w-full flex items-center justify-center group/waist cursor-crosshair z-10 hover:z-20">
                   <div className="relative flex items-center w-full max-w-[180px] justify-center">
                     <div className="w-[60%] h-[2px] bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.8)] relative transition-all duration-300 group-hover/waist:scale-x-110 group-hover/waist:bg-emerald-500 group-hover/waist:h-[3px]">
                       <div className="absolute -left-6 md:-left-12 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                         <span className="bg-white border-2 border-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm transition-all group-hover/waist:border-emerald-500 group-hover/waist:scale-110">Waist</span>
                       </div>
                       {/* Tooltip */}
                       <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-900 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover/waist:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover/waist:translate-y-0">
                         Measure around the natural waistline
                         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Hips Line (Purple) */}
                 <div className="absolute top-[65%] left-0 w-full flex items-center justify-center group/hips cursor-crosshair z-10 hover:z-20">
                   <div className="relative flex items-center w-full max-w-[200px] justify-center">
                     <div className="w-[85%] h-[2px] bg-purple-500/80 shadow-[0_0_8px_rgba(168,85,247,0.8)] relative transition-all duration-300 group-hover/hips:scale-x-110 group-hover/hips:bg-purple-500 group-hover/hips:h-[3px]">
                       <div className="absolute -left-6 md:-left-12 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                         <span className="bg-white border-2 border-purple-500/20 text-purple-600 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm transition-all group-hover/hips:border-purple-500 group-hover/hips:scale-110">Hips</span>
                       </div>
                       {/* Tooltip */}
                       <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-900 text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 group-hover/hips:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover/hips:translate-y-0">
                         Measure around the fullest part of hips
                         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Step Instructions */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 <div className="bg-white p-3 rounded-xl border border-red-100 hover:border-red-200 shadow-sm transition-all group/card hover:shadow-md cursor-default">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold group-hover/card:bg-red-500 group-hover/card:text-white transition-colors">1</div>
                     <p className="text-xs font-bold text-foreground">Chest</p>
                   </div>
                   <p className="text-[10px] text-muted-foreground leading-relaxed">Keep tape level under arms and across shoulder blades.</p>
                 </div>
                 <div className="bg-white p-3 rounded-xl border border-emerald-100 hover:border-emerald-200 shadow-sm transition-all group/card hover:shadow-md cursor-default">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold group-hover/card:bg-emerald-500 group-hover/card:text-white transition-colors">2</div>
                     <p className="text-xs font-bold text-foreground">Waist</p>
                   </div>
                   <p className="text-[10px] text-muted-foreground leading-relaxed">Measure natural waistline, without holding breath.</p>
                 </div>
                 <div className="bg-white p-3 rounded-xl border border-purple-100 hover:border-purple-200 shadow-sm transition-all group/card hover:shadow-md cursor-default">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold group-hover/card:bg-purple-500 group-hover/card:text-white transition-colors">3</div>
                     <p className="text-xs font-bold text-foreground">Hips</p>
                   </div>
                   <p className="text-[10px] text-muted-foreground leading-relaxed">Stand with feet together and measure fullest part.</p>
                 </div>
               </div>
            </div>
            {/* ===== PRIVACY SECTION ===== */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 shadow-lg text-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Privacy First</h4>
                  <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                    Your measurements are processed locally to compute sizing and are <span className="text-white font-semibold flex items-center gap-1 inline-flex"><Lock className="w-3 h-3"/>never stored</span> permanently on our servers.
                  </p>
                  <Button variant="link" className="text-teal-400 p-0 h-auto font-semibold text-xs hover:text-teal-300">
                    Read Privacy Policy <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          
          {/* ===== SMART SIZE TABLE ===== */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-2 sm:p-6 border border-border/50 shadow-sm relative overflow-hidden h-full scroll-mt-24" id="size-table">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-0 sm:mb-6 gap-4">
                 <div>
                   <h3 className="text-xl font-bold flex items-center gap-2">International Chart</h3>
                   <p className="text-sm text-muted-foreground mt-1">Cross-reference measurements with global standards.</p>
                 </div>
                 {highlightSize && (
                   <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 shadow-sm text-sm">
                     Target Row Highlighted
                   </Badge>
                 )}
               </div>

               <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-border/50">
                 <table className="w-full text-sm text-left" role="table">
                   <thead className="bg-muted/50 border-b border-border/50">
                     <tr>
                       {SIZE_CHART.headers.map((h, i) => (
                         <th key={h} className={`px-4 sm:px-6 py-4 font-bold text-gray-700 whitespace-nowrap ${i === 0 ? 'bg-muted/80 sticky left-0 z-10' : ''}`}>
                           {h}
                         </th>
                       ))}
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/30">
                     {SIZE_CHART.rows.map((row, i) => {
                       const isHighlighted = row[0] === highlightSize;
                       
                       return (
                         <tr 
                           key={i} 
                           className={`group transition-all duration-300 ${
                             isHighlighted 
                               ? 'bg-primary/5 hover:bg-primary/10' 
                               : 'hover:bg-muted/30 bg-white'
                           }`}
                         >
                           {row.map((cell, j) => (
                             <td key={j} className={`px-4 sm:px-6 py-4 whitespace-nowrap transition-colors ${
                               j === 0 
                                 ? `font-black text-base sticky left-0 z-10 ${isHighlighted ? 'bg-primary/5 text-primary' : 'bg-white group-hover:bg-muted/30 text-gray-900'}` 
                                 : isHighlighted ? 'text-gray-900 font-medium' : 'text-muted-foreground'
                             }`}>
                               {j === 0 && isHighlighted && (
                                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                               )}
                               {cell}
                             </td>
                           ))}
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
               
               <div className="mt-8 p-6 bg-muted/30 rounded-2xl border border-dashed border-border flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Want absolute certainty?</h4>
                  <p className="text-sm text-muted-foreground mb-5 max-w-md">Take the guesswork out of shopping. Try our AI Virtual Fitting Room to see exactly how garments drape and fit on your unique body shape in 3D.</p>
                  <Button 
                    size="lg" 
                    className="rounded-full font-bold px-8 shadow-[0_8px_20px_rgba(var(--primary),0.2)] bg-gradient-to-r from-primary to-teal-500 hover:scale-105 transition-all"
                    onClick={() => navigate('/fitting-room')}
                  >
                    Open Virtual Fitting Room <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
               </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}




