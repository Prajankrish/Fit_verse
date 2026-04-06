import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { api } from "@/utils/api";

export function WishlistSheet({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (!localStorage.getItem("fitverse_user")) {
        toast("Sign in securely to unlock this feature.", {
          description: "Join FitVerse to start building your Smart Wardrobe.",
          action: {
            label: "Log In",
            onClick: () => navigate("/login")
          }
        });
        sessionStorage.setItem("fitverse_redirect", "/");
        return;
      }
      setOpen(newOpen);
    } else {
      setOpen(newOpen);
    }
  };

  useEffect(() => {
    if (open) {
      loadWishlist();
    }
  }, [open]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.getWishlist();
      setItems(res.items || []);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Wishlist" className={`relative ${className || ""}`}>
          <Heart className="h-5 w-5 transition-transform group-hover:scale-110" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Your Wishlist
          </SheetTitle>
        </SheetHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Your wishlist is empty.</p>
            <p className="text-sm mt-2">Try items in the Fitting Room and save them here!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-muted/50 rounded-xl border border-border/50">
                <div className="w-20 h-24 bg-card rounded-md border overflow-hidden flex-shrink-0">
                  {item.garment_image ? (
                    <img src={item.garment_image} alt={item.garment_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">No Img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{item.garment_name}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Size: {item.size}</span>
                    {item.fit_score && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full">
                        Fit: {Math.round(item.fit_score)}%
                      </span>
                    )}
                  </div>
                  {item.style_combination && item.style_combination.occasion && (
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      Vibe: {item.style_combination.occasion.charAt(0).toUpperCase() + item.style_combination.occasion.slice(1)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}