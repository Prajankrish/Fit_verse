import { Ruler, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

const TIPS = [
  "Measure yourself wearing lightweight clothing for the most accurate results.",
  "Take measurements standing up straight with arms relaxed at your sides.",
  "For bust, measure at the fullest part. For waist, at the narrowest point.",
  "If between sizes, we recommend sizing up for comfort.",
];

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-coral-teal flex items-center justify-center">
            <Ruler className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            Size <span className="text-gradient">Guide</span>
          </h1>
        </div>
        <p className="text-muted-foreground mb-8">Find your perfect fit across international sizing standards</p>

        {/* Size Chart */}
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="gradient-coral-teal">
                  {SIZE_CHART.headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-primary-foreground font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.rows.map((row, i) => (
                  <tr key={i} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className={`px-4 py-3 whitespace-nowrap ${j === 0 ? "font-bold text-primary" : "text-muted-foreground"}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Measurement Tips */}
        <div className="rounded-2xl bg-card border border-border/50 p-6 mb-8">
          <h2 className="text-xl font-display font-bold mb-4">How to Measure</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-muted/30">
                <span className="w-6 h-6 rounded-full gradient-coral-teal flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">Still unsure? Try our virtual fitting room for a personalized recommendation.</p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/fitting-room">Open Fitting Room <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
