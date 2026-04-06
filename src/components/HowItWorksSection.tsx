import { Upload, Shirt, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload Your Photo",
    description: "Share a clear selfie and let our AI analyze your body shape, proportions, and measurements.",
    color: "from-primary to-orange-400",
  },
  {
    icon: Shirt,
    number: "02",
    title: "Select Your Outfit",
    description: "Browse 10,000+ garments from partner brands and choose what you want to try on.",
    color: "from-purple-400 to-pink-400",
  },
  {
    icon: CheckCircle,
    number: "03",
    title: "Get Smart Recommendations",
    description: "AI predicts your fit size and recommends styles perfect for your body and preferences.",
    color: "from-secondary to-emerald-400",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-background">
      {/* Background radial soft lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 md:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-bold text-xs uppercase tracking-widest mb-6">
            <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
            Simple & Intuitive
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight">
            How FitVerse <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Three simple steps to find your perfect fit. Takes less than 30 seconds.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16 relative">
          
          {/* Animated Connection line (desktop only) */}
          <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-px border-t-2 border-dashed border-border/80 z-0">
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 animate-[shimmer_3s_linear_infinite]" style={{ transform: 'translateY(-1px)' }} />
          </div>

          {steps.map((step, index) => (
            <div key={step.number} className="relative group z-10">
              {/* Card */}
              <div className="relative h-full p-8 md:p-10 rounded-[2rem] bg-card/50 backdrop-blur-xl border border-border/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 ease-out group hover:border-primary/30 hover:-translate-y-3 cursor-default">
                
                {/* Step number badge */}
                <div className="relative mb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-[0_10px_20px_rgba(var(--primary),0.3)]`}>
                    <span className="text-white font-bold text-2xl tracking-tighter">{step.number}</span>
                  </div>
                  {/* Subtle glow behind badge */}
                  <div className={`absolute top-2 left-2 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                </div>

                {/* Icon placeholder with animation */}
                <div className="absolute top-8 right-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <step.icon className="w-24 h-24 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 tracking-tight group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-8">
                  {step.description}
                </p>

                {/* Animated arrow indicator */}
                {index < steps.length - 1 && (
                  <div className="flex items-center gap-2 text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <span>Next Step</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline visual for mobile */}
        <div className="md:hidden flex justify-center items-center gap-3 my-8">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary" />
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-gradient-to-r from-primary/50 to-secondary/50" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-8 border-t border-border/50">
          <p className="text-muted-foreground mb-4 text-sm">
            ✨ Most users complete this in under 30 seconds
          </p>
          <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
            Try It Free Now
          </button>
        </div>
      </div>
    </section>
  );
}
