import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Search, SlidersHorizontal, Grid3X3, LayoutList, Loader2, Sparkles } from "lucide-react";
import { api, Garment } from "../utils/api";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["All", "Tops", "Bottoms", "Dresses", "Outerwear"];
const GENDERS = ["All", "Men", "Women", "Kids"];

export default function BrowsePage() {
  const navigate = useNavigate();
  
  const [garments, setGarments] = useState<Garment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [gender, setGender] = useState("All");
  
  const [page, setPage] = useState(0);
  const [grid, setGrid] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const LIMIT = 48;

  useEffect(() => {
    setPage(0);
    loadProducts(true, 0);
  }, [category, gender, searchQuery]);

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

      const response = await api.getGarments(LIMIT, currentPage * LIMIT, searchQuery, catFilter, genFilter);
      
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

  const handleTryOn = (garment: Garment) => {
    navigate('/fitting-room', { state: { selectedGarment: garment } });
  };

  const hasMore = garments.length < total;

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-3">
              Browse <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Collection</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Discover {total > 0 ? total.toLocaleString() : 'thousands of'} clothing items powered by our real-world dataset.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search brands, styles, etc..." 
                className="pl-9 bg-white border-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0 hidden sm:flex border-2">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Badge 
                    key={cat}
                    variant={category === cat ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1.5 px-4 rounded-full transition-colors hover:bg-primary/90 hover:text-primary-foreground"
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Department:</span>
                  <div className="flex gap-1.5">
                    {GENDERS.map((gen) => (
                      <Badge 
                        key={gen}
                        variant={gender === gen ? "secondary" : "outline"}
                        className="cursor-pointer text-xs transition-colors"
                        onClick={() => setGender(gen)}
                      >
                        {gen}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1 border rounded-md p-1 bg-muted/50">
                  <Button variant="ghost" size="icon" className={`h-8 w-8 ${grid ? 'bg-white shadow-sm' : ''}`} onClick={() => setGrid(true)}>
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className={`h-8 w-8 ${!grid ? 'bg-white shadow-sm' : ''}`} onClick={() => setGrid(false)}>
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-lg">Fetching products...</p>
              </div>
            ) : garments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">No items found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setCategory("All"); setGender("All"); }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className={grid ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                  {garments.map((item) => (
                    <div 
                      key={item.id} 
                      className={`group bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 ${grid ? 'flex flex-col h-full' : 'flex flex-row h-48'}`}
                    >
                      <div className={`relative bg-gray-100 overflow-hidden ${grid ? 'aspect-[3/4] w-full' : 'w-40 md:w-56 shrink-0'}`}>
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=400&h=500`;
                          }}
                        />
                        <button 
                          onClick={(e) => toggleFav(item.id, e)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-600 hover:text-red-500 hover:bg-white transition-colors z-10 shadow-sm"
                        >
                          <Heart className={`h-4 w-4 ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                          <Button 
                            onClick={() => handleTryOn(item)}
                            className="w-full max-w-[160px] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl bg-white text-black hover:bg-gray-100"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Try On Avatar
                          </Button>
                        </div>
                      </div>
                      
                      <div className={`p-4 flex flex-col ${grid ? 'flex-1' : 'justify-center flex-1'}`}>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div>
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{item.brand}</p>
                            <h3 className={`font-medium text-gray-900 leading-tight ${grid ? 'line-clamp-2' : 'line-clamp-2 text-lg'}`} title={item.name}>
                              {item.name}
                            </h3>
                          </div>
                          <span className="font-bold text-lg shrink-0">${item.price?.toFixed(2)}</span>
                        </div>
                        
                        <div className={`mt-auto pt-4 flex items-center gap-2 ${grid ? 'flex-wrap' : ''}`}>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">{item.category}</Badge>
                          <Badge variant="outline" className="border-gray-200 text-gray-600">{item.fabric || 'Blend'}</Badge>
                          {!grid && <span className="text-sm text-muted-foreground ml-auto">{Object.keys(item.specifications?.sizes || {}).length || 5} sizes</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {hasMore && (
                  <div className="mt-12 flex justify-center pb-8">
                    <Button 
                      size="lg"
                      className="px-12 py-6 text-base font-medium min-w-[240px] shadow-sm"
                      onClick={() => setPage(page + 1)}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <><Loader2 className="w-5 h-5 mr-3 animate-spin"/> Loading more...</>
                      ) : (
                        "Load More Products"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
