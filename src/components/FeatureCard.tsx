import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isPrimary?: boolean;
  gradient?: string;
  animationDelay?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  isPrimary = false,
  gradient = "from-primary to-secondary",
  animationDelay = "0s",
}: FeatureCardProps) {
  if (isPrimary) {
    return (
      <div
        className="group relative lg:col-span-2 h-full lg:row-span-2 overflow-hidden rounded-[2.5rem] bg-card border border-border/80 p-8 md:p-12 shadow-[0_15px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(var(--primary),0.12)] transition-all duration-700 ease-out hover:-translate-y-3 hover:scale-[1.01] hover:border-primary/40 animate-fade-in cursor-pointer"
        style={{ animationDelay }}
      >
        {/* Animated gradient background tint */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700 ease-out`} />

        {/* Floating accent shapes */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-tr from-secondary/30 to-primary/30 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            {/* Icon with glow & rotate/pulse */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary p-[1px] mb-8 inline-flex shadow-xl group-hover:shadow-[0_20px_40px_rgba(var(--primary),0.3)] transition-all duration-500 group-hover:-translate-y-2">
              <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:bg-transparent transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Icon className="h-7 w-7 text-primary group-hover:text-white relative z-10 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-4 tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text transition-all duration-500">
              {title}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg group-hover:text-foreground/90 transition-colors duration-300">
              {description}
            </p>
          </div>

          {/* CTA hint */}
          <div className="flex items-center gap-2 mt-8 text-primary font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <span className="border-b-2 border-primary/30 group-hover:border-primary pb-0.5">Explore feature</span>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative h-full overflow-hidden rounded-2xl bg-card border border-border/80 p-6 md:p-8 hover:shadow-[0_20px_40px_rgba(var(--primary),0.08)] transition-all duration-700 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/40 animate-fade-in"
      style={{ animationDelay }}
    >
      {/* Hover gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 ease-out`} />

      <div className="relative z-10">
        {/* Icon with animation */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-[15deg] group-hover:shadow-[0_10px_20px_rgba(var(--primary),0.2)] transition-all duration-500 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Icon className="h-6 w-6 text-white relative z-10" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
          {description}
        </p>

        {/* Decorative line on hover */}
        <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-500 ease-out" />
      </div>
    </div>
  );
}
