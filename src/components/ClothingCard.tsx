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
      className={`group rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        isInOutfit
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/50 hover:border-primary/20"
      }`}
      onClick={() => onToggleOutfit(item.id)}
      role="button"
      tabIndex={0}
      aria-label={`${isInOutfit ? "Remove" : "Add"} ${item.name}`}
      onKeyDown={(e) => e.key === "Enter" && onToggleOutfit(item.id)}
    >
      <div className="aspect-square bg-muted/30 flex items-center justify-center text-4xl">
        {item.image}
      </div>
      <div className="p-3">
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
