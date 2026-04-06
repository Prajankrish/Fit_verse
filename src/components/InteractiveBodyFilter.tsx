import { useState } from "react";

const bodyTypes = [
  { id: "slim", label: "Slim", emoji: "🤸" },
  { id: "average", label: "Average", emoji: "👨" },
  { id: "athletic", label: "Athletic", emoji: "💪" },
  { id: "muscular", label: "Muscular", emoji: "🏋️" },
  { id: "plus-size", label: "Plus-size", emoji: "👸" },
  { id: "petite", label: "Petite", emoji: "👧" },
  { id: "tall", label: "Tall", emoji: "🧑" },
  { id: "curvy", label: "Curvy", emoji: "💃" },
];

export function InteractiveBodyFilter() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className="py-8 bg-gradient-to-r from-background via-card to-background border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 w-fit mx-auto mb-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            8+ Body Types
          </span>
        </div>

        <h2 className="text-center text-2xl md:text-3xl font-display font-bold mb-3">
          Find Your Perfect Fit
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Select a body type to see how garments naturally drape.
        </p>

        {/* Interactive filter chips */}
        <div className="flex flex-wrap gap-3 lg:gap-4 justify-center">
          {bodyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelected(selected === type.id ? null : type.id)}
              className={`
                group relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-700 ease-out
                flex items-center gap-2.5 overflow-hidden whitespace-nowrap outline-none
                ${
                  selected === type.id
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-[0_8px_20px_rgba(var(--primary),0.35)] scale-105 border-transparent"
                    : "bg-background border border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:scale-[1.02]"
                }
              `}
              title="See how it fits your body type"
            >
              {/* Background glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 transition-opacity duration-700 ${selected !== type.id ? 'group-hover:opacity-100' : ''}`} />

              {/* Content */}
              <span className={`relative text-lg transition-transform duration-700 ease-out group-hover:scale-110 ${selected === type.id ? 'scale-110 drop-shadow-md' : ''}`}>{type.emoji}</span>
              <span className="relative tracking-wide">{type.label}</span>

              {/* Ripple effect on select */}
              {selected === type.id && (
                <div className="absolute inset-0 rounded-full border border-white/40 animate-[pulse-soft_2s_infinite]" />
              )}
            </button>
          ))}
        </div>

        {/* Feedback text */}
        <div className={`text-center mt-8 transition-all duration-500 ease-out ${selected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-sm shadow-sm">
            <span className="text-muted-foreground">Showing tailored preview for</span>
            <span className="font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {bodyTypes.find((t) => t.id === selected)?.label}
            </span> 
            <span className="text-muted-foreground">body type</span>
          </div>
        </div>
      </div>
    </section>
  );
}
