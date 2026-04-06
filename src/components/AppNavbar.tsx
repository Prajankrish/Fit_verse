import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, Heart, Search, User, Sparkles, LogOut, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistSheet } from "./WishlistSheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCard, Shield, UserCircle, Plus } from "lucide-react";

export function AppNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Auth & Search State
  const [user, setUser] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Shopping Bag State
  const [bagOpen, setBagOpen] = useState(false);
  const [bagItems, setBagItems] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Check Auth & Bag
    const storedUser = localStorage.getItem("fitverse_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch(e) {}
    }

    const storedBag = localStorage.getItem("fitverse_bag");
    if (storedBag) {
      try { setBagItems(JSON.parse(storedBag)); } catch(e) {}
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("fitverse_user");
    localStorage.removeItem("fitverse_onboarding");
    setUser(null);
    window.location.href = "/";
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        setSearchResults([
          { id: 1, name: "Casual Summer Dress", type: "Dress", match: 92 },
          { id: 2, name: "Urban Denim Jacket", type: "Outerwear", match: 85 },
          { id: 3, name: "Classic White Sneakers", type: "Shoes", match: 98 }
        ]);
      }, 600);
    } else {
      setSearchResults([]);
    }
  };

  const removeFromBag = (id: string) => {
    const newBag = bagItems.filter(item => item.id !== id);
    setBagItems(newBag);
    localStorage.setItem("fitverse_bag", JSON.stringify(newBag));
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Fitting Room", path: "/fitting-room" },
    { name: "Browse", path: "/browse" },
    { name: "Size Guide", path: "/size-guide" },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled || !isHome ? "bg-white/80 backdrop-blur-md border-b shadow-sm" : "bg-transparent text-white"
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <div className="w-8 h-8 rounded-full gradient-coral-teal flex items-center justify-center shrink-0 shadow-lg">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className={`font-display font-bold text-xl tracking-tight ${scrolled || !isHome ? "text-foreground" : "text-white"}`}>
                FitVerse
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-muted/20 backdrop-blur-lg rounded-full px-2 py-1.5 border border-border/50">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? "bg-white text-primary shadow-sm"
                      : scrolled || !isHome 
                        ? "text-muted-foreground hover:text-foreground hover:bg-muted/50" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              
              {/* Smart Search */}
              <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={`rounded-full ${scrolled || !isHome ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/20"}`}>
                    <Search className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="w-full flex flex-col pt-16 px-4 pb-8 sm:px-8 bg-white/95 backdrop-blur-xl border-b shadow-xl">
                  <div className="max-w-3xl mx-auto w-full relative">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                      <Input 
                        placeholder="Search standard items or ask AI (e.g. 'summer wedding outfits for pear shape')..." 
                        className="pl-14 h-16 text-lg rounded-2xl bg-muted/30 border-0 focus-visible:ring-2 shadow-inner"
                        value={searchQuery}
                        onChange={handleSearch}
                        autoFocus
                      />
                      {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />}
                    </div>
                    
                    {searchQuery.length < 3 ? (
                      <div className="mt-8 flex gap-8">
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">AI Suggestions</h4>
                          <div className="flex gap-2 flex-wrap">
                            {["Evening Dresses", "Casual Blazers", "High Waisted Jeans", "Athleisure"].map(tag => (
                              <Badge key={tag} variant="secondary" className="px-3 py-1.5 cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors" onClick={() => setSearchQuery(tag)}>
                                <Sparkles className="w-3 h-3 mr-1.5" /> {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex-1 border-l pl-8 hidden sm:block">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Recent Searches</h4>
                          <div className="flex flex-col gap-2">
                            {["Nike Air Max", "Boho Maxi Skirt", "Formal Suits"].map(s => (
                              <span key={s} className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors" onClick={() => setSearchQuery(s)}>{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Results</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {searchResults.map(res => (
                            <div key={res.id} className="flex gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border">
                              <div className="w-12 h-16 bg-gradient-to-br from-primary/10 to-teal-500/10 rounded-md flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-sm line-clamp-1">{res.name}</h5>
                                <p className="text-xs text-muted-foreground">{res.type}</p>
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">{res.match}% Match</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              <WishlistSheet className={`rounded-full ${scrolled || !isHome ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/20"}`} />
              
              {/* Shopping Bag */}
              <Sheet open={bagOpen} onOpenChange={setBagOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={`relative rounded-full ${scrolled || !isHome ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/20"}`}>
                    <ShoppingBag className="w-5 h-5" />
                    {bagItems.length > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {bagItems.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md bg-white border-l shadow-2xl flex flex-col">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" /> Shopping Bag
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto py-4">
                    {bagItems.length === 0 ? (
                      <div className="text-center py-20">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="font-bold text-lg">Your bag is empty</h3>
                        <p className="text-muted-foreground text-sm mt-2">Discover our collection and find your perfect fit.</p>
                        <Button className="mt-6 rounded-full" onClick={() => {setBagOpen(false); window.location.href='/browse'}}>Browse Styles</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bagItems.map(item => (
                          <div key={item.id} className="flex gap-4 p-4 rounded-2xl border bg-muted/20">
                            <div className="w-20 h-24 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                               <img src={item.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80"} className="w-full h-full object-cover mix-blend-multiply" alt={item.name} />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                               <div>
                                 <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                    <Button variant="ghost" size="icon" className="w-6 h-6 -mt-1 -mr-1" onClick={() => removeFromBag(item.id)}><X className="w-3 h-3"/></Button>
                                 </div>
                                 <p className="text-xs text-muted-foreground mt-0.5">{item.brand || 'FitVerse Elite'}</p>
                               </div>
                               <div className="flex justify-between items-end">
                                 <div className="flex items-center gap-2">
                                    <span className="text-xs bg-white border px-2 py-0.5 rounded shadow-sm font-semibold">Size: {item.size || 'M'}</span>
                                 </div>
                                 <span className="font-extrabold text-sm">${item.price || '89.99'}</span>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {bagItems.length > 0 && (
                    <div className="pt-4 border-t mt-auto">
                      <div className="flex justify-between mb-4 font-bold">
                        <span>Total ({bagItems.length} items)</span>
                        <span className="text-xl">${bagItems.reduce((acc, curr) => acc + (curr.price || 89.99), 0).toFixed(2)}</span>
                      </div>
                      <Button className="w-full h-14 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 text-lg shadow-xl font-bold transition-all">
                        Checkout Securely
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`h-10 w-10 p-0 rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all ${scrolled || !isHome ? "bg-muted" : "bg-white/20"}`}>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar || ""} alt={user.name || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-teal-500 text-white font-bold">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-2 p-2 rounded-2xl border-border/50 shadow-xl bg-white/95 backdrop-blur-xl" align="end" forceMount>
                    <DropdownMenuLabel className="p-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm border-b pb-2 mb-1 font-bold leading-none">{user.name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-2">{user.email || 'user@example.com'}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuGroup>
                      <Link to="/profile">
                        <DropdownMenuItem className="p-3 cursor-pointer rounded-xl hover:bg-primary/5 transition-colors focus:bg-primary/5">
                          <UserCircle className="mr-3 h-4 w-4 text-primary" />
                          <span className="font-medium">Profile Settings</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/profile?tab=measurements">
                        <DropdownMenuItem className="p-3 cursor-pointer rounded-xl hover:bg-primary/5 transition-colors focus:bg-primary/5">
                          <Plus className="mr-3 h-4 w-4 text-emerald-500" />
                          <span className="font-medium">Measurements</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/profile?tab=billing">
                        <DropdownMenuItem className="p-3 cursor-pointer rounded-xl hover:bg-primary/5 transition-colors focus:bg-primary/5">
                          <CreditCard className="mr-3 h-4 w-4 text-orange-500" />
                          <span className="font-medium">Billing Details</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/profile?tab=privacy">
                        <DropdownMenuItem className="p-3 cursor-pointer rounded-xl hover:bg-primary/5 transition-colors focus:bg-primary/5">
                          <Shield className="mr-3 h-4 w-4 text-purple-500" />
                          <span className="font-medium">Privacy & Security</span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem className="p-3 cursor-pointer rounded-xl text-red-600 focus:bg-red-50 focus:text-red-700 transition-colors" onClick={handleLogout}>
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-bold">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" className={`rounded-full font-semibold ${scrolled || !isHome ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/20"}`}>
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="hero" size="sm" className="rounded-full font-bold shadow-md lg:px-6">
                      Get Started <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-3">
              <WishlistSheet className={`${scrolled || !isHome ? "text-foreground" : "text-white"}`} />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-colors ${
                  scrolled || !isHome ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
                }`}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden absolute w-full bg-background border-b shadow-xl transition-all duration-300 overflow-hidden ${
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-2xl text-base font-semibold ${
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-muted"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-border/50 pt-4 mt-4 flex flex-col gap-3">
              {user ? (
                 <>
                   <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted transition-colors">
                     <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                       {user.avatar ? (
                         <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                       ) : (
                         user.name?.charAt(0) || 'U'
                       )}
                     </div>
                     <div>
                       <p className="font-bold text-sm">{user.name || 'User'}</p>
                       <p className="text-xs text-muted-foreground">View Profile</p>
                     </div>
                   </Link>
                   <Button variant="outline" className="w-full justify-start rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={() => {
                     handleLogout();
                     setIsOpen(false);
                   }}>
                     <LogOut className="w-4 h-4 mr-2" /> Sign Out
                   </Button>
                 </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full text-white font-bold rounded-xl h-12 shadow-md bg-gradient-to-r from-primary to-teal-500">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Search Overlay overlay logic is handled by Sheet within AppNavbar component */}
    </>
  );
}
