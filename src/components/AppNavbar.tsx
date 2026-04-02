import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart, ShoppingBag, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";
import { WishlistSheet } from "@/components/WishlistSheet";
import { toast } from "sonner";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Fitting Room", path: "/fitting-room" },
  { label: "Browse", path: "/browse" },
  { label: "Size Guide", path: "/size-guide" },
];

export function AppNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="FitVerse Home">
          <img src={logoImg} alt="FitVerse logo" className="h-8 w-8" />
          <span className="font-display text-2xl tracking-tight">
            <span className="text-primary font-bold">Fit</span>
            <span className="text-secondary font-semibold">Verse</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={() => toast.info("Search coming soon!")}>
            <Search className="h-5 w-5" />
          </Button>
          <WishlistSheet />
          <Button variant="ghost" size="icon" aria-label="Shopping bag" onClick={() => toast.info("Cart functionality coming soon!")}>
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" className="ml-2" onClick={() => toast.info("Sign in functional demo!")}>
            <User className="h-4 w-4 mr-1" /> Sign In
          </Button>
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/50 glass animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-2">
              <Button variant="ghost" size="icon" aria-label="Search" onClick={() => toast.info("Search coming soon!")}><Search className="h-5 w-5" /></Button>
              <WishlistSheet />
              <Button variant="ghost" size="icon" aria-label="Bag" onClick={() => toast.info("Cart coming soon!")}><ShoppingBag className="h-5 w-5" /></Button>
              <Button variant="outline" size="sm" className="ml-auto" onClick={() => toast.info("Sign in functional demo!")}><User className="h-4 w-4 mr-1" /> Sign In</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
