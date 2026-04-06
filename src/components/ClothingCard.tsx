import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ClothingItem {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  fabric: string;
  image: string;
}

interface ClothingCardProps {
  item: ClothingItem;
  isInOutfit: boolean;
  isFavorite: boolean;
  onToggleOutfit: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

export default function ClothingCard({ item, isInOutfit, isFavorite, onToggleOutfit, onToggleFavorite }: ClothingCardProps) {
  return (
    <div
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:glow-effect ${
        isInOutfit
          ? "border-2 border-primary bg-primary/10 shadow-lg"
          : "border-border/50 border hover:border-primary/50 glass-panel"
      }`}
      onClick={() => onToggleOutfit(item.id)}
      role="button"
      tabIndex={0}
      aria-label={`${isInOutfit ? "Remove" : "Add"} ${item.name}`}
      onKeyDown={(e) => e.key === "Enter" && onToggleOutfit(item.id)}
    >
      <div className="aspect-square bg-muted/30 flex items-center justify-center text-4xl relative overflow-hidden">
        <span className="transition-transform duration-500 group-hover:scale-110">{item.image}</span>
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
          <Button 
            className="gradient-coral-teal text-white border-0 font-semibold px-6 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            onClick={(e) => { e.stopPropagation(); onToggleOutfit(item.id); }}
          >
            {isInOutfit ? "Remove" : "Try On"}
          </Button>
        </div>
      </div>
      <div className="p-4 bg-background/80 backdrop-blur-md">
        <h4 className="font-semibold text-sm mb-1 truncate">{item.name}</h4>
        <p className="text-xs text-muted-foreground">{item.brand} · {item.fabric}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="font-bold text-sm">${item.price}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
            aria-label={`${isFavorite ? "Remove from" : "Add to"} favorites`}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-primary text-primary" : ""}`} />
          </Button>
        </div>
        {isInOutfit && (
          <Badge className="mt-1.5 bg-primary/10 text-primary border-0 text-xs">✓ In outfit</Badge>
        )}
      </div>
    </div>
  );
}
