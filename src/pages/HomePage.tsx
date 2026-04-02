import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, RotateCcw, Shirt } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const features = [
  {
    icon: Users,
    title: "Inclusive Body Models",
    description: "8+ body types, diverse skin tones, and gender-inclusive avatars that celebrate every body.",
  },
  {
    icon: RotateCcw,
    title: "360° Visualization",
    description: "Rotate, zoom, and inspect every detail of how garments fit your unique body shape.",
  },
  {
    icon: Shirt,
    title: "Realistic Draping",
    description: "Advanced fabric simulation shows how cotton, silk, denim and more actually fall on your body.",
  },
  {
    icon: Sparkles,
    title: "Smart Fit Prediction",
    description: "AI-powered size recommendations based on your measurements and brand-specific sizing.",
  },
];

const bodyTypes = ["Slim", "Average", "Athletic", "Muscular", "Plus-size", "Petite", "Tall", "Curvy"];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Diverse group of people in stylish outfits" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36 lg:py-44">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" /> Every Body. Every Style.
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Your Virtual <br />
              <span className="text-primary">Dressing Room</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-md animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Try on clothes virtually with photorealistic 3D avatars that match your body. Inclusive, accurate, and fun.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/fitting-room">
                  Start Trying On <ArrowRight className="h-5 w-5 ml-1" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" className="text-primary-foreground border-primary-foreground/20" asChild>
                <Link to="/browse">Browse Collection</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Body Type Ticker */}
      <section className="py-6 gradient-coral-teal overflow-hidden">
        <div className="flex animate-pulse-soft gap-8 justify-center flex-wrap px-4">
          {bodyTypes.map((type) => (
            <span key={type} className="text-primary-foreground/90 font-medium text-sm tracking-wide uppercase">
              {type}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Fashion Meets <span className="text-gradient">Technology</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              A revolutionary fitting experience designed for every body type, powered by cutting-edge 3D visualization.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-coral-teal flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-coral-teal">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Ready to Find Your Perfect Fit?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-md mx-auto">
            Create your avatar, try on outfits, and shop with confidence — all from your device.
          </p>
          <Button variant="glass" size="xl" className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
            <Link to="/fitting-room">Get Started Free <ArrowRight className="h-5 w-5 ml-1" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-display text-xl tracking-tight">
              <span className="text-primary font-bold">Fit</span>
              <span className="text-secondary font-semibold">Verse</span>
            </span>
            <p className="text-sm text-muted-foreground">© 2026 FitVerse. Celebrating every body.</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
