import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Upload, User, Shirt, Activity, ShieldCheck, Zap, Scissors, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="min-h-screen overflow-hidden pt-20" ref={scrollRef}>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-background" />
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[100px] animate-[pulse-soft_4s_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-secondary/10 rounded-full blur-[100px] animate-[pulse-soft_5s_infinite_reverse]" />
        
        <div className="animate-fade-in space-y-6 max-w-4xl mx-auto z-10">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-ping" />
            The Future of Fashion
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            How <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">FitVerse</span> Works
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light">
            Experience the magic of AI-powered virtual try-ons. Find your perfect fit in seconds without ever stepping into a store.
          </p>
          
          {/* Visual Flow Highlights */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 pt-8 text-muted-foreground font-medium">
            <div className="flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Upload</div>
            <ArrowRight className="w-4 h-4 opacity-50 hidden md:block" />
            <div className="flex items-center gap-2"><User className="w-5 h-5 text-secondary" /> Avatar</div>
            <ArrowRight className="w-4 h-4 opacity-50 hidden md:block" />
            <div className="flex items-center gap-2"><Shirt className="w-5 h-5 text-indigo-500" /> Try-On</div>
            <ArrowRight className="w-4 h-4 opacity-50 hidden md:block" />
            <div className="flex items-center gap-2"><Activity className="w-5 h-5 text-orange-500" /> Predict Fit</div>
          </div>
        </div>
      </section>

      {/* ===== STEP-BY-STEP FLOW ===== */}
      <section className="py-24 bg-muted/30 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">4 Simple Steps to Perfection</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our advanced AI seamlessly translates your photo into a highly accurate 3D model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-secondary/50 to-transparent hidden md:block -translate-x-1/2 rounded-full" />

            {/* Step 1 */}
            <div className="glass-panel p-8 rounded-3xl border border-white/20 shadow-xl relative animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100 group hover:border-primary/50">
              <div className="absolute -top-6 -left-6 md:-right-6 md:left-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xl font-bold shadow-lg z-10">1</div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Upload Your Photo</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Take a quick full-body photo or upload one from your gallery. Our system works best with form-fitting clothes and good lighting.
              </p>
            </div>

            {/* Spacer for staggered grid */}
            <div className="hidden md:block"></div>
            <div className="hidden md:block"></div>

            {/* Step 2 */}
            <div className="glass-panel p-8 rounded-3xl border border-white/20 shadow-xl relative animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200 group hover:border-secondary/50">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-indigo-500 text-white flex items-center justify-center text-xl font-bold shadow-lg z-10">2</div>
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Avatar Generation</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our deep learning models analyze your body proportions to instantly generate a precise, private 3D avatar customized to your exact measurements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel p-8 rounded-3xl border border-white/20 shadow-xl relative animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300 group hover:border-indigo-500/50">
              <div className="absolute -top-6 -left-6 md:-right-6 md:left-auto w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xl font-bold shadow-lg z-10">3</div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shirt className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Virtual Try-On</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Browse our extensive catalog of real-world garments. With a single click, see how any item drapes, fits, and looks directly on your avatar.
              </p>
            </div>

            {/* Spacer for staggered grid */}
            <div className="hidden md:block"></div>
            <div className="hidden md:block"></div>

            {/* Step 4 */}
            <div className="glass-panel p-8 rounded-3xl border border-white/20 shadow-xl relative animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-400 group hover:border-orange-500/50">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 text-white flex items-center justify-center text-xl font-bold shadow-lg z-10">4</div>
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Predict Your Fit</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Get an instant compatibility score powered by AI. We analyze stretch, fabric, and sizing charts to tell you exactly how the garment will feel in real life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRIVACY SECTION ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="glass-panel p-10 md:p-14 rounded-[2.5rem] border border-border/50 shadow-2xl relative overflow-hidden animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full font-semibold text-sm">
                  <ShieldCheck className="w-5 h-5" /> Bank-Grade Security
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Your Privacy is Our Priority</h2>
                <p className="text-muted-foreground text-lg">
                  We believe your data belongs to you. Our architecture is designed with absolute privacy from the ground up.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-foreground font-medium">Images are NEVER stored permanently.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-foreground font-medium">Temporary processing only during your session.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-foreground font-medium">Secure, encrypted localized AI generation.</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-full min-h-[300px] rounded-3xl overflow-hidden glass-panel border border-white/10 flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-8">
                <ShieldCheck className="w-48 h-48 text-primary/20 animate-[pulse-soft_4s_infinite]" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VALUE SECTION ===== */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">Why Choose FitVerse?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl border border-white/20 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100 hover:-translate-y-2 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 overflow-hidden relative">
                <Scissors className="w-8 h-8 text-blue-500 relative z-10 group-hover:rotate-12 transition-transform" />
              </div>
              <h3 className="text-xl font-bold mb-3">Millimeter Accuracy</h3>
              <p className="text-muted-foreground">Cutting-edge photogrammetry precisely maps your specific body type and dimensions.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-white/20 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200 hover:-translate-y-2 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">From upload to full 3D try-on rendering in under 5 seconds. No waiting around.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-white/20 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300 hover:-translate-y-2 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                <Smartphone className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced AI Core</h3>
              <p className="text-muted-foreground">Powered by neural networks trained on millions of garments to understand fabric physics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-32 relative overflow-hidden text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-primary/5" />
        <div className="container mx-auto px-4 relative z-10 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Ready to Transform Your Wardrobe?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of users who have discovered their perfect fit. Step into the virtual fitting room today.
          </p>
          <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg font-medium shadow-[0_0_40px_rgba(var(--primary),0.4)] hover:scale-105 transition-all">
            <Link to="/fitting-room">
              Start Your Virtual Try-On <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
