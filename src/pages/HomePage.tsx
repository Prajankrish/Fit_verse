import { Link } from "react-router-dom";
import { useAuthNavigate } from "@/hooks/useAuthNavigate";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, RotateCcw, Shirt, Zap, Eye, CheckCircle } from "lucide-react";
import { FloatingAvatarPanel } from "@/components/FloatingAvatarPanel";
import { InteractiveBodyFilter } from "@/components/InteractiveBodyFilter";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeatureCard } from "@/components/FeatureCard";
import LivePreviewSection from "@/components/LivePreviewSection";
import { TrendingOutfitsSection } from "@/components/TrendingOutfitsSection";
import { ImageWithSkeleton } from "@/components/ui/ImageWithSkeleton";
import heroImage from "@/assets/hero-image.jpg";

const features = [
  {
    icon: Users,
    title: "Inclusive Body Models",
    description: "8+ body types, diverse skin tones, and gender-inclusive avatars that celebrate every body.",
    gradient: "from-pink-400 to-primary",
  },
  {
    icon: RotateCcw,
    title: "360° Visualization",
    description: "Rotate, zoom, and inspect every detail of how garments fit your unique body shape.",
    gradient: "from-purple-400 to-pink-400",
  },
  {
    icon: Shirt,
    title: "Realistic Draping",
    description: "Advanced fabric simulation shows how cotton, silk, denim and more actually fall on your body.",
    gradient: "from-blue-400 to-secondary",
  },
  {
    icon: Zap,
    title: "Smart Fit Prediction",
    description: "AI-powered size recommendations based on your measurements and brand-specific sizing.",
    gradient: "from-secondary to-emerald-400",
  },
];

export default function HomePage() {
  const authNavigate = useAuthNavigate();
  return (
    <div className="min-h-screen overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center pt-20 pb-12">
        {/* Background with animated gradient overlay */}
        <div className="absolute inset-0 -z-10 bg-background/50">
          <ImageWithSkeleton
            src={heroImage}
            alt="Diverse group of people in stylish outfits"
            className="w-full h-full absolute inset-0 translate-x-4 lg:translate-x-12 scale-105"
            imgClassName="object-cover object-center w-full h-full"
          />
          {/* Apply gradient ONLY on text side (left) with reduced intensity to keep models visible and premium */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-3/4 bg-gradient-to-r from-background via-background/80 to-transparent mix-blend-normal" />
          
          {/* Subtle animated gradient blob for depth */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-full blur-[60px] animate-blob mix-blend-multiply" />
        </div>

        {/* Main hero content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Headline + CTA */}
            <div className="space-y-6 md:space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary font-semibold text-sm w-fit">
                <Sparkles className="h-4 w-4 animate-spin" />
                Every Body. Every Style.
              </div>

              <div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-4">
                  Your Virtual <br />
                  <span className="text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text animate-pulse">
                    Dressing Room
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Try on clothes virtually with photorealistic 3D avatars that match your body. Inclusive, accurate, and fun.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                <Button
                  size="xl"
                  className="h-16 px-10 bg-gradient-to-r from-primary to-secondary hover:shadow-[0_12px_25px_rgba(var(--primary),0.4)] hover:-translate-y-1 transition-all duration-300 ease-out text-white font-semibold text-lg rounded-2xl group w-full sm:w-auto relative overflow-hidden"
                  onClick={() => authNavigate('/fitting-room')}
                >
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    Try It On Yourself
                    <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="h-16 px-10 border-2 border-primary/20 hover:border-primary/50 text-foreground font-semibold text-lg rounded-2xl hover:bg-primary/5 hover:shadow-lg transition-all duration-300 ease-out flex items-center group w-full sm:w-auto"
                  onClick={() => authNavigate('/browse')}
                >
                    Browse Collection
                    <Eye className="h-5 w-5 ml-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </div>

              {/* Trust signal */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Takes less than 30 seconds
              </div>
            </div>

            {/* Right: Floating Avatar Panel */}
            <div className="relative h-[500px] hidden lg:flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <FloatingAvatarPanel />
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE BODY FILTER ===== */}
      <InteractiveBodyFilter />

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-secondary/5 to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section header */}
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <div className="w-2 h-2 bg-primary rounded-full" />
              Cutting-Edge Technology
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Fashion Meets <span className="text-gradient">Technology</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A revolutionary fitting experience designed for every body type, powered by cutting-edge 3D visualization and AI-powered insights.
            </p>
          </div>

          {/* Features grid - 1 primary + 3 secondary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Primary featured card */}
            <FeatureCard
              icon={Zap}
              title="Smart Fit Prediction"
              description="AI-powered size recommendations based on your measurements and brand-specific sizing with 95% accuracy."
              isPrimary={true}
              gradient="from-primary to-secondary"
              animationDelay="0s"
            />

            {/* Secondary cards */}
            {features.slice(0, 3).map((f, i) => (
              <FeatureCard
                key={f.title}
                icon={f.icon}
                title={f.title}
                description={f.description}
                isPrimary={false}
                gradient={f.gradient}
                animationDelay={`${(i + 1) * 0.1}s`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <HowItWorksSection />

      {/* ===== LIVE PREVIEW SECTION ===== */}
      <LivePreviewSection />

      {/* ===== TRENDING OUTFITS SECTION ===== */}
      <TrendingOutfitsSection />

      {/* ===== ENHANCED CTA SECTION ===== */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-background">
        {/* Animated gradient background layers */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-[100px] animate-[pulse-soft_4s_infinite]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/20 to-primary/10 rounded-full blur-[100px] animate-[pulse-soft_5s_infinite_reverse]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Animated cluster */}
            <div className="mb-10 flex justify-center items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted/50 flex items-center justify-center -rotate-12 animate-bounce shadow-sm border border-border/50">
                <img src="https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=100" alt="Jeans" className="w-full h-full object-cover" />
              </div>
              <div className="relative w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_15px_35px_rgba(var(--primary),0.3)] z-10 border-2 border-white/20">
                <Sparkles className="h-10 w-10 text-white animate-pulse" />
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted/50 flex items-center justify-center rotate-12 animate-bounce shadow-sm border border-border/50" style={{ animationDelay: "0.2s" }}>
                <img src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=100" alt="Shirt" className="w-full h-full object-cover" />
              </div>
            </div>

            <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight">
              Ready to Find Your <span className="text-gradient">Perfect Fit?</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
              Create your avatar, try on gorgeous outfits, and shop with confidence — all from your device.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-2 mb-10">
              <div className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-sm font-semibold mb-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-ping" />
                <span className="text-secondary/90 tracking-wide uppercase">Try your first outfit in under 30 seconds</span>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mt-2 opacity-80">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> Trusted by 10,000+ users</span>
                <span className="hidden sm:block text-border">•</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> 95% Accuracy</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center mt-8">
              <Button
                size="xl"
                className="h-16 px-10 bg-gradient-to-r from-primary to-secondary hover:shadow-[0_15px_30px_rgba(var(--primary),0.4)] hover:-translate-y-1 transition-all duration-300 ease-out text-white font-bold text-lg rounded-2xl group w-full sm:w-auto relative overflow-hidden"
                asChild
              >
                <Link to="/fitting-room">
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="h-16 px-10 border-2 border-primary/20 hover:border-primary/50 text-foreground font-semibold text-lg rounded-2xl hover:bg-primary/5 hover:shadow-lg transition-all duration-300 ease-out flex items-center group w-full sm:w-auto"
                asChild
              >
                <Link to="/size-guide">Learn More</Link>
              </Button>
            </div>

            {/* Social proof / features */}
            <div className="mt-16 pt-10 border-t border-border/50 flex items-center justify-center gap-8 md:gap-16 text-sm flex-wrap">
              {[
                { icon: <Users size={18} className="text-primary"/>, text: "10K+ Users" },
                { icon: <CheckCircle size={18} className="text-emerald-500"/>, text: "95% Accuracy" },
                { icon: <Zap size={18} className="text-secondary"/>, text: "30 Seconds" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 border-t border-border/50 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <span className="font-display text-2xl tracking-tight">
                <span className="text-primary font-bold">Fit</span>
                <span className="text-secondary font-semibold">Verse</span>
              </span>
              <p className="text-sm text-muted-foreground mt-2">
                The future of fashion fitting.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Try Virtual</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Browse</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Size Guide</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Accessibility</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 FitVerse. Celebrating every body.
            </p>
            <div className="flex gap-6">
              {["Twitter", "Instagram", "LinkedIn"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-10px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>
    </div>
  );
}
