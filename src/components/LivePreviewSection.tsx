import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Wand2, Upload, Shirt, Loader2, CheckCircle2, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ImageWithSkeleton } from '@/components/ui/ImageWithSkeleton';

export default function LivePreviewSection() {
  const [step, setStep] = useState(0);

  // Auto-cycle through the 4 phases
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { label: "Upload Photo", highlight: "border-primary shadow-primary/30", icon: <Upload className="w-4 h-4" /> },
    { label: "Select Dress", highlight: "border-secondary shadow-secondary/30", icon: <Shirt className="w-4 h-4" /> },
    { label: "Processing", highlight: "border-amber-400 shadow-amber-400/30", icon: <Loader2 className="w-4 h-4 animate-spin" /> },
    { label: "Result", highlight: "border-emerald-500 shadow-emerald-500/30", icon: <CheckCircle2 className="w-4 h-4" /> }
  ];

  const images = {
    user: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
    outfit: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=600",
    result: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600",
    placeholderUser: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=600&blur=100",  // abstract blurred portrait
    placeholderDress: "https://images.unsplash.com/photo-1589810635656-7fa4cb813898?auto=format&fit=crop&q=80&w=600&blur=100", // abstract blurred mannequin
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 mix-blend-multiply" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10 mix-blend-multiply" />

      <div className="container px-4 text-center max-w-5xl relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20">
          <Wand2 className="w-4 h-4" />
          See the Magic Live
        </div>
        
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
          From Photo to <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">Perfect Fit</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-16 max-w-2xl mx-auto">
          Experience our real-time virtual try-on technology. Just upload your photo, select any garment, and let our AI do the styling.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          
          {/* USER BOX */}
          <div className={`relative group w-48 md:w-56 aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-700 bg-muted/30 border-2 ${step >= 0 ? steps[0].highlight : 'border-transparent'} shadow-xl hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer`}>
            <div className={`absolute inset-0 bg-black/40 z-10 transition-opacity duration-500 opacity-0`} />
            <ImageWithSkeleton src={step >= 0 ? images.user : images.placeholderUser} alt="User" />
            <div className="absolute top-4 left-4 z-20 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-border/50 flex flex-row items-center gap-2">
              <span className="text-primary">{steps[0].icon}</span> {step >= 0 ? "Selfie Uploaded" : steps[0].label}
            </div>
            {step === 0 && (
              <div className="absolute inset-0 z-20 border-4 border-primary rounded-2xl animate-pulse-soft pointer-events-none" />
            )}
          </div>

          <div className={`text-4xl text-muted-foreground font-light transition-opacity duration-700 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
            +
          </div>

          {/* DRESS BOX */}
          <div className={`relative group w-48 md:w-56 aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-700 bg-muted/30 border-2 ${step >= 1 ? steps[1].highlight : 'border-transparent'} shadow-xl hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer`}>
            <div className={`absolute inset-0 transition-opacity duration-500 ${step >= 1 ? 'bg-black/10' : 'bg-black/60'} z-10 pointer-events-none`} />
            <ImageWithSkeleton src={step >= 1 ? images.outfit : images.placeholderDress} alt="Dress" className={`transition-all duration-700 ${step < 1 ? 'grayscale blur-sm' : ''}`} />
            
            <div className="absolute top-4 left-4 z-20 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-border/50 flex flex-row items-center gap-2">
              <span className="text-secondary">{steps[1].icon}</span> {step >= 1 ? "Outfit Selected" : steps[1].label}
            </div>
            {step === 1 && (
              <div className="absolute inset-0 z-20 border-4 border-secondary rounded-2xl animate-pulse-soft pointer-events-none" />
            )}
          </div>

          <div className={`text-4xl text-muted-foreground transition-opacity duration-700 ${step >= 2 ? 'opacity-100 text-primary' : 'opacity-30'}`}>
            <ArrowRight className="w-8 h-8" />
          </div>

          {/* RESULT BOX */}
          <div className={`relative group w-56 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-700 bg-muted/30 border-2 ${step >= 2 ? (step === 3 ? steps[3].highlight : steps[2].highlight) : 'border-transparent'} shadow-2xl z-10 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer`}>
            
            {step === 3 ? (
              <>
                <ImageWithSkeleton src={images.result} alt="Result" className="animate-fade-in" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
                
                <div className="absolute top-4 left-4 z-20 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-border/50 flex flex-row items-center gap-2 animate-fade-in">
                  <span className="text-emerald-500">{steps[3].icon}</span> Finished
                </div>

                <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center animate-bounce">
                  <div className="bg-emerald-500 text-white backdrop-blur-md px-5 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Perfect Fit
                  </div>
                </div>
              </>
            ) : step === 2 ? (
               <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <ImageWithSkeleton src={images.user} alt="Processing" className="absolute inset-0 opacity-40 blur-md scale-110" />
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
                  
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 border-4 border-amber-400/20 rounded-full animate-ping" />
                      <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center border-2 border-amber-400 text-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                      </div>
                    </div>
                    <span className="mt-6 text-sm font-semibold text-amber-500 animate-pulse bg-background/80 px-3 py-1 rounded-full shadow-sm">AI Fitting Outfit...</span>
                  </div>
               </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center relative text-muted-foreground/60 transition-opacity bg-muted/20">
                <ImageWithSkeleton src={images.placeholderUser} alt="Awaiting" className="absolute inset-0 opacity-20 grayscale" />
                <div className="absolute inset-0 bg-background/50" />
                <Wand2 className="w-10 h-10 mb-3 opacity-30 relative z-10" />
                <span className="text-sm font-medium relative z-10 bg-background/50 px-3 py-1 rounded-full border border-border/50">Awaiting Assets</span>
              </div>
            )}
          </div>

        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in">
          <Button size="xl" className="h-16 px-10 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-[0_15px_30px_rgba(var(--primary),0.4)] hover:-translate-y-1 transition-all duration-300 ease-out text-white font-bold text-lg relative overflow-hidden group w-full sm:w-auto" asChild>
            <Link to="/fitting-room">
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              Try it yourself <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
