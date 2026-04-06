import { useState, useEffect } from "react";
import { Upload, Sparkles, ChevronRight, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";

export function FloatingAvatarPanel() {
  const [avatarRotation, setAvatarRotation] = useState(0);
  const [activeOutfit, setActiveOutfit] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const outfits = [
    { name: "Casual", color: "from-blue-500 to-cyan-400", userBase: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80" },
    { name: "Formal", color: "from-purple-500 to-indigo-400", userBase: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80", image: "https://images.unsplash.com/photo-1539082261536-072281ebcfd3?auto=format&fit=crop&w=600&q=80" },
    { name: "Sports", color: "from-emerald-400 to-teal-400", userBase: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80" },
  ];

  useEffect(() => {
    // Smooth continuous rotation
    const rotationTimer = setInterval(() => {
      setAvatarRotation((prev) => (prev + 0.5) % 360);
    }, 30);

    // Auto-switch outfits every 3 seconds unless hovered
    const outfitTimer = setInterval(() => {
      if (!isHovered) {
        setActiveOutfit((prev) => (prev + 1) % outfits.length);
      }
    }, 3500);

    return () => {
      clearInterval(rotationTimer);
      clearInterval(outfitTimer);
    };
  }, [outfits.length, isHovered]);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-transparent rounded-[3rem] blur-[80px] opacity-70 mix-blend-screen transition-opacity duration-700"
        style={{ animation: "float 8s ease-in-out infinite" }}
      />

      {/* Main glassmorphic panel */}
      <div 
        className="relative bg-background/40 backdrop-blur-2xl border border-white/30 p-8 w-full max-w-lg rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] group hover:shadow-[0_50px_100px_rgba(var(--primary),0.25)] hover:-translate-y-3 transition-all duration-700 ease-out z-10"
        style={{ animation: "float 6s ease-in-out infinite reverse" }}
      >
        {/* Decorative corner elements */}
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-secondary to-primary rounded-full blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700" />

        {/* Live Demo Header */}
        <div className="flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-foreground tracking-wider uppercase">Live Fitting Demo</span>
          </div>
          <div className="flex bg-muted/60 backdrop-blur-md rounded-full p-1 border border-border/40">
            {outfits.map((outfit, idx) => (
              <button
                key={outfit.name}
                onClick={() => setActiveOutfit(idx)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 transform relative overflow-hidden ${
                  activeOutfit === idx 
                    ? `bg-foreground text-background shadow-md scale-100` 
                    : "text-muted-foreground hover:text-foreground hover:scale-105"
                }`}
              >
                {outfit.name}
              </button>
            ))}
          </div>
        </div>

        {/* Image Preview Engine */}
        <div className="relative mb-8 grid grid-cols-[1fr_auto_1fr] gap-4 items-center group/avatar cursor-pointer">
          
          {/* User Input Avatar */}
          <div className="flex flex-col gap-3">
             <div className="relative aspect-[3/4] w-full rounded-2xl bg-muted overflow-hidden border border-white/20 shadow-inner group-hover/avatar:shadow-lg transition-all duration-500">
               <ImageWithSkeleton 
                  src={outfits[activeOutfit].userBase} 
                  alt="User Base" 
                  className="w-full h-full object-cover" 
                  imgClassName="grayscale-[20%] group-hover/avatar:scale-105 transition-transform duration-700"
               />
               <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-md text-foreground">
                 Step 1: You
               </div>
             </div>
          </div>

          {/* AI Magic Middle */}
          <div className="flex flex-col items-center justify-center relative">
             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg relative z-10 group-hover/avatar:scale-110 transition-transform duration-300">
                <Wand2 className="w-5 h-5 text-white animate-pulse" />
             </div>
             {/* Particles logic visual */}
             <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_30%,#00000000_80%,rgba(var(--primary),0.6)_100%)] opacity-80 blur-sm rounded-full w-24 h-24 -translate-y-7 -translate-x-7" style={{ transform: `rotate(${avatarRotation}deg)` }} />
          </div>

          {/* AI Generated Fit */}
          <div className="flex flex-col gap-3">
             <div className={`relative aspect-[3/4] w-full rounded-2xl bg-gradient-to-br p-[2px] transition-all duration-700 shadow-xl overflow-hidden ${outfits[activeOutfit].color}`}>
               <div className="w-full h-full rounded-2xl bg-background/80 backdrop-blur-sm overflow-hidden relative group-hover/avatar:shadow-2xl">
                 <ImageWithSkeleton 
                    key={outfits[activeOutfit].image} // Force re-render for clean enter animation
                    src={outfits[activeOutfit].image} 
                    alt={`Fit ${outfits[activeOutfit].name}`} 
                    className="w-full h-full object-cover z-0 animate-fade-in"
                    imgClassName="group-hover/avatar:scale-110 transition-transform duration-1000 ease-out"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                 <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/20 backdrop-blur-md text-xs font-bold px-2 py-1 rounded-md text-white border border-white/30 truncate">
                   <Sparkles className="w-3 h-3 text-white" /> Step 2: Perfect Fit
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="relative z-20 space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-display font-bold mb-2 tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Want to see it on yourself?</h3>
            <p className="text-sm text-muted-foreground/90 font-medium">
              Our AI creates your 3D digital twin in seconds.
            </p>
          </div>

          {/* Deep Glow CTA Button */}
          <div className="relative group/btn w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-lg opacity-40 group-hover/btn:opacity-80 group-hover/btn:duration-500 duration-1000 animate-pulse" />
            <Button
              className="relative w-full h-14 bg-gradient-to-r from-primary to-secondary hover:shadow-[0_8px_25px_rgba(var(--primary),0.5)] transition-all duration-300 text-white font-bold rounded-2xl text-lg overflow-hidden flex items-center justify-center gap-2"
              size="lg"
            >
              {/* Shine effect overlay */}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
              <Upload className="h-5 w-5 group-hover/btn:-translate-y-1 transition-transform duration-300" />
              <span>Upload Video or Photo</span>
              <ChevronRight className="h-5 w-5 opacity-70 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  );
}
