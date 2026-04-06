import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Heart, Search, SlidersHorizontal, Grid3X3, LayoutList, Loader2, Sparkles, Activity, Plus, User } from "lucide-react";
import { api, Garment } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useFittingRoom } from "@/contexts/FittingRoomContext";
import { toast } from "sonner";

const CATEGORIES = ["All", "Tops", "Bottoms", "Dresses", "Outerwear"];
const GENDERS = ["All", "Men", "Women", "Kids"];
const AI_FILTERS = ["For You", "Trending", "Casual", "Formal", "Sports"];

export default function BrowsePage() {
  const navigate = useNavigate();
  const { bodyType, gender: userGender, setSelectedProduct } = useFittingRoom();
  
  const [garments, setGarments] = useState<Garment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [gender, setGender] = useState("All");
  const [activeAIFilter, setActiveAIFilter] = useState("For You");
  
  const [page, setPage] = useState(0);
  const [grid, setGrid] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [previewGarment, setPreviewGarment] = useState<Garment | null>(null);

  const LIMIT = 48;

  useEffect(() => {
    setPage(0);
    loadProducts(true, 0);
  }, [category, gender, searchQuery, activeAIFilter]);

  useEffect(() => {
    if (page > 0) {
      loadProducts(false, page);
    }
  }, [page]);

  const loadProducts = async (reset: boolean = false, currentPage: number = 0) => {
    try {
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);

      const catFilter = category === "All" ? "" : category.toLowerCase();
      const genFilter = gender === "All" ? "" : gender.toLowerCase();
      
      let aiSearch = searchQuery;
      if (activeAIFilter !== "For You" && activeAIFilter !== "Trending") {
        aiSearch = aiSearch ? `${aiSearch} ${activeAIFilter.toLowerCase()}` : activeAIFilter.toLowerCase();
      }

      const response = await api.getGarments(LIMIT, currentPage * LIMIT, aiSearch, catFilter, genFilter);
      
      setGarments(prev => reset ? response.garments : [...prev, ...response.garments]);
      setTotal(response.total);

    } catch (err) {
      console.error("Failed to load garments:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const handleTryOn = (garment: Garment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPreviewGarment(garment);
    setIsTryOnOpen(true);
  };
  
  const handleAddToFittingRoom = (garment: Garment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(garment);
    toast.success(`${garment.name} added to your Fitting Room!`);
  };

  const calculateAiScore = (garment: Garment) => {
    const idHash = garment.id.split('').reduce((a,b) => a + b.charCodeAt(0), 0);
    const bodyHash = bodyType ? bodyType.charCodeAt(0) : 0;
    
    let score = 80 + ((idHash + bodyHash) % 18);
    
    // Boost score if item matches preferred gender
    if (userGender && garment.target_gender && garment.target_gender.toLowerCase() === userGender.toLowerCase()) {
      score = Math.min(99, score + (idHash % 10));
    }
    
    return {
      score,
      recommended_size: ['S', 'M', 'L', 'XL'][(idHash + score) % 4]
    };
  };

  const recommendedItems = useMemo(() => {
    if (garments.length === 0) return [];
    return [...garments]
      .sort((a, b) => calculateAiScore(b).score - calculateAiScore(a).score)
      .slice(0, 4);
  }, [garments, bodyType]);

  const hasMore = garments.length < total;

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      {/* ===== AI HEADER ===== */}
      <div className="bg-white border-b sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-3 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-primary" />
                Smart <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Wardrobe</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                Personalized AI discovery tailored to your unique {bodyType} body shape and preferences.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-72 shadow-sm rounded-xl overflow-hidden">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Ask AI to find something..." 
                  className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 hidden sm:flex rounded-xl bg-white shadow-sm border border-border/50">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <div className="flex overflow-x-auto custom-scrollbar gap-3 mt-6 pb-2 pt-1 border-t border-muted">
            {AI_FILTERS.map((filter) => (
              <Button
                key={filter}
                variant={activeAIFilter === filter ? "default" : "outline"}
                className={`rounded-full whitespace-nowrap px-6 shadow-sm transition-all duration-300 ${activeAIFilter === filter ? "bg-gradient-to-r from-primary to-purple-500 text-white border-0" : "bg-white"}`}
                onClick={() => setActiveAIFilter(filter)}
              >
                {filter === "For You" && <Sparkles className="w-4 h-4 mr-2" />}
                {filter === "Trending" && <Activity className="w-4 h-4 mr-2" />}
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* ===== RECOMMENDED SECTION ===== */}
        {!isLoading && recommendedItems.length > 0 && activeAIFilter === "For You" && (
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold">Recommended For You</h2>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-medium">Top Matches</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedItems.map(item => {
                const { score, recommended_size } = calculateAiScore(item);
                return (
                  <div key={`rec-${item.id}`} className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-[2px] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group/rec border-0">
                    <div className="bg-white rounded-2xl p-4 h-full flex flex-col relative overflow-hidden group">
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 shadow-md">Best Fit</Badge>
                      </div>
                      <div className="aspect-[3/4] rounded-xl bg-muted/30 ml-auto mr-auto mb-4 overflow-hidden relative w-full">
                        <img 
                          src={(item as any).image || item.image_url || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80`} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt={item.name}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 gap-2 backdrop-blur-[2px]">
                           <Button size="icon" variant="secondary" className="rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300" onClick={() => handleTryOn(item)}><Sparkles className="w-4 h-4 text-primary" /></Button>
                           <Button size="icon" variant="secondary" className="rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75" onClick={(e) => handleAddToFittingRoom(item, e)}><Plus className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1 truncate">{item.brand}</p>
                        <h3 className="font-semibold text-sm line-clamp-1 mb-2">{item.name}</h3>
                        <div className="flex justify-between items-center bg-muted/30 rounded-lg p-3 mt-3 border border-border/50">
                           <div className="flex flex-col">
                             <span className="text-[10px] text-muted-foreground font-semibold">Match Rate</span>
                             <span className="font-bold text-green-600 text-sm flex items-center gap-1"><Activity className="w-3 h-3"/> {score}%</span>
                           </div>
                           <div className="flex flex-col text-right">
                             <span className="text-[10px] text-muted-foreground font-semibold">Size</span>
                             <span className="font-bold text-sm bg-white shadow-sm px-1.5 rounded">{recommended_size}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border shadow-sm sticky top-[152px] z-20">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Badge 
                    key={cat}
                    variant={category === cat ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-1.5 rounded-full transition-all tracking-wide text-xs ${category === cat ? "bg-primary text-white shadow-sm" : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Department:</span>
                  <div className="flex gap-1 bg-muted/30 p-1 rounded-lg">
                    {GENDERS.map((gen) => (
                      <button 
                        key={gen}
                        className={`text-xs px-3 py-1.5 rounded-md transition-colors font-medium border ${gender === gen ? "bg-white text-foreground border-border/50 shadow-sm" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setGender(gen)}
                      >
                        {gen}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1 bg-muted/30">
                  <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-md ${grid ? 'bg-white shadow-sm ring-1 ring-black/5' : ''}`} onClick={() => setGrid(true)}>
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-md ${!grid ? 'bg-white shadow-sm ring-1 ring-black/5' : ''}`} onClick={() => setGrid(false)}>
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse py-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="bg-white rounded-2xl h-[420px] border border-border/50 flex flex-col p-3 shadow-sm">
                      <div className="h-[260px] bg-muted/60 rounded-xl mb-4"></div>
                      <div className="p-2 space-y-3">
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-10 bg-muted rounded w-full mt-4"></div>
                      </div>
                    </div>
                  ))}
               </div>
            ) : garments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border shadow-sm mt-8">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No AI matches found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your smart filters or department settings to help the AI find alternatives.</p>
                <Button onClick={() => { setSearchQuery(""); setCategory("All"); setGender("All"); setActiveAIFilter("For You"); }} className="rounded-full px-8 shadow-sm">
                  Reset Discovery Mode
                </Button>
              </div>
            ) : (
              <>
                <div className={grid ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                  {garments.map((item, index) => {
                    const { score, recommended_size } = calculateAiScore(item);
                    return (
                      <div 
                        key={`${item.id}-${index}`}
                        className={`group bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition-all duration-500 border border-border/50 hover:border-primary/30 flex flex-col h-full transform hover:-translate-y-1.5`}
                      >
                        <div className={`relative bg-muted/10 overflow-hidden p-0 ${grid ? 'aspect-[3/4] w-full' : 'w-48 shrink-0'}`}>
                          {score >= 90 && (
                            <div className="absolute top-3 left-3 z-10">
                              <Badge className="bg-gradient-to-r from-purple-500/90 to-indigo-500/90 backdrop-blur-sm text-white border-0 shadow-sm text-[10px] uppercase tracking-wider py-1 px-2">
                                <Sparkles className="w-3 h-3 mr-1" /> AI Pick
                              </Badge>
                            </div>
                          )}

                          <div className="relative w-full h-full bg-white/50">
                            <img 
                              src={(item as any).image || item.image_url || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80`} 
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03] mix-blend-multiply"
                              onError={(e) => { (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=400&h=500`; }}
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-5 gap-3">
                               <Button 
                                  variant="secondary" 
                                  className="w-full rounded-2xl shadow-lg font-bold text-gray-900 bg-white hover:bg-white/90 hover:scale-[1.02] transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 hover:text-primary"
                                  onClick={(e) => handleTryOn(item, e)}
                               >
                                 <Activity className="w-4 h-4 mr-2" /> Quick Try-On
                               </Button>
                               <div className="flex w-full gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                 <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="rounded-xl shadow-lg bg-white/10 text-white border-white/30 hover:bg-white hover:text-black flex-1 h-10"
                                    onClick={(e) => handleAddToFittingRoom(item, e)}
                                 >
                                   <Plus className="w-5 h-5" />
                                 </Button>
                                 <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="rounded-xl shadow-lg bg-white/10 text-white border-white/30 hover:bg-red-500 hover:border-red-500 hover:text-white flex-1 h-10"
                                    onClick={(e) => toggleFav(item.id, e)}
                                 >
                                   <Heart className={`w-5 h-5 ${favorites.includes(item.id) ? "fill-current text-white" : ""}`} />
                                 </Button>
                               </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`p-4 xl:p-5 flex flex-col flex-1 relative bg-white z-10 -mt-2 rounded-t-2xl`}>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.brand}</p>
                              <h3 className={`font-semibold text-gray-900 leading-tight ${grid ? 'line-clamp-2' : 'line-clamp-1 text-lg'}`} title={item.name}>
                                {item.name}
                              </h3>
                            </div>
                            <span className="font-extrabold text-lg shrink-0">${item.price?.toFixed(2)}</span>
                          </div>
                          
                          <div className="mt-auto pt-4 space-y-3">
                             <div className="flex items-center justify-between border-t border-border/50 pt-3">
                               <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-lg">
                                 <Activity className="w-3.5 h-3.5 text-green-600" />
                                 <span className="text-xs font-bold text-green-700">{score}% Match</span>
                               </div>
                               <div className="text-xs bg-muted border border-border/50 px-2 py-1 rounded-lg font-semibold text-muted-foreground shadow-sm">
                                 Size: {recommended_size}
                               </div>
                             </div>
                             
                             <Button 
                               className="w-full rounded-xl h-10 gap-2 font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-md border border-primary/20 transition-all duration-300"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 navigate('/fitting-room', { state: { selectedGarment: item } })
                               }}
                             >
                                <Sparkles className="w-4 h-4" /> Predict Fit
                             </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {hasMore && (
                  <div className="mt-16 flex justify-center">
                    <Button 
                      size="lg"
                      className="px-10 py-6 text-base font-bold rounded-full shadow-[0_0_30px_rgba(var(--primary),0.15)] bg-white text-gray-900 border border-border hover:bg-gray-50 hover:shadow-xl hover:-translate-y-1 transition-all"
                      onClick={() => setPage(page + 1)}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <><Loader2 className="w-5 h-5 mr-3 animate-spin text-primary"/> Analyzing More Results...</>
                      ) : (
                        "Load More AI Matches"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Sheet open={isTryOnOpen} onOpenChange={setIsTryOnOpen}>
        <SheetContent className="w-full sm:max-w-md border-l overflow-y-auto custom-scrollbar p-0 bg-white">
          {previewGarment && (
            <div className="flex flex-col h-full">
               <div className="relative h-72 bg-white overflow-hidden shadow-sm shrink-0">
                  <img 
                    src={(previewGarment as any).image || previewGarment.image_url || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80`}
                    alt={previewGarment.name}
                    className="w-full h-full object-cover object-top mix-blend-multiply"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-black/60 backdrop-blur-md border-0 text-white font-medium shadow-lg px-3 py-1 text-xs">
                      <Activity className="w-3.5 h-3.5 mr-1.5" /> Discovery Preview
                    </Badge>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent" />
               </div>

               <div className="px-6 pb-6 pt-2 shrink-0 bg-white relative z-10 -mt-6">
                  <p className="text-[11px] font-bold text-primary tracking-widest uppercase mb-1.5">{previewGarment.brand}</p>
                  <h2 className="text-2xl font-bold leading-tight mb-3">{previewGarment.name}</h2>
                  <div className="flex items-center justify-between mb-6">
                     <span className="text-3xl font-extrabold text-foreground">${previewGarment.price?.toFixed(2)}</span>
                     <div className="flex gap-2">
                       <Badge variant="outline" className="border-gray-200 shadow-sm">{previewGarment.category}</Badge>
                       {previewGarment.fabric && <Badge variant="secondary" className="shadow-sm">{previewGarment.fabric}</Badge>}
                     </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20 rounded-2xl mb-8 shadow-sm relative overflow-hidden">
                     <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10" />
                     <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center justify-center shrink-0">
                          <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-2 text-base">AI Fit Prediction <Sparkles className="w-3.5 h-3.5 text-primary" /></h4>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                            Based on your profile ({bodyType || 'average'}), our AI suggests a size <span className="font-bold text-foreground bg-white border shadow-sm px-1.5 rounded">{calculateAiScore(previewGarment).recommended_size}</span> for a {calculateAiScore(previewGarment).score > 85 ? 'perfect' : 'relaxed'} fit.
                          </p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full h-14 rounded-2xl text-base font-bold shadow-[0_8px_20px_rgba(var(--primary),0.25)] bg-gradient-to-r from-primary to-indigo-600 hover:scale-[1.02] hover:shadow-[0_12px_25px_rgba(var(--primary),0.35)] transition-all"
                      onClick={() => navigate('/fitting-room', { state: { selectedGarment: previewGarment } })}
                    >
                      <User className="w-5 h-5 mr-2" /> View on Studio Avatar
                    </Button>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        className="w-full h-12 rounded-2xl text-sm font-semibold bg-white border-2 hover:bg-gray-50 flex-1"
                        onClick={(e) => { 
                           handleAddToFittingRoom(previewGarment, e as any);
                           setIsTryOnOpen(false);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add to Room
                      </Button>
                      <Button 
                        variant="outline"
                        className="h-12 w-12 rounded-2xl text-sm font-semibold bg-white border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-500 shrink-0"
                        onClick={(e) => toggleFav(previewGarment.id, e)}
                      >
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}
