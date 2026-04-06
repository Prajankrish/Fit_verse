import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithSkeleton } from '@/components/ui/ImageWithSkeleton';
import { Link } from 'react-router-dom';
import { api, Garment } from '@/utils/api';

const categories = ["All", "Casual", "Formal", "Party", "Activewear"];

export function TrendingOutfitsSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProducts();
        
        let garments = data.garments || [];
        if (activeCategory !== 'All') {
          const categoryLower = activeCategory.toLowerCase();
          garments = garments.filter(g => (g.category || '').toLowerCase() === categoryLower);
        }
        
        // Dataset might have 'img_url' or 'image' and we map them appropriately.
        // And also filter out anything that has no valid image at all.
        const mappedItems = garments.map((item: any) => ({
          ...item,
          image: item.image || item.img_url,
          id: item.id || item.product_id
        })).filter((item: any) => !!item.image);
        
        setItems(mappedItems.slice(0, 10)); // keep limit=10 logic
      } catch (err) {
        console.error("Error fetching trending outfits:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, [activeCategory]);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden border-t border-border/40">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              Trending Now
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
              Community <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">Favorites</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover the most popular virtual try-ons from our global community of fashion enthusiasts.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden md:flex border-primary/20 hover:border-primary/50 items-center rounded-full group" asChild>
              <Link to="/browse">
                View All Collection <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="icon" onClick={scrollLeft} className="rounded-full w-10 h-10 border-border/80 hover:bg-primary/5 hover:text-primary">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={scrollRight} className="rounded-full w-10 h-10 border-border/80 hover:bg-primary/5 hover:text-primary">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-300 snap-start border ${
                activeCategory === category
                  ? "bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-[0_8px_20px_rgba(var(--primary),0.3)] scale-105"
                  : "bg-background border-border/80 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Scrollable Layout */}
        <div className="relative group/carousel">
          <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-12 pt-4 snap-x shrink-0 scrollbar-hide px-4 md:auto-cols-auto scroll-smooth">
            
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="group flex-shrink-0 w-[280px] snap-start border rounded-3xl bg-card border-border/50">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-3xl bg-muted">
                    <div className="w-full h-full animate-pulse bg-muted-foreground/10" />
                  </div>
                  <div className="p-5">
                    <div className="h-4 w-1/3 bg-muted-foreground/20 rounded animate-pulse mb-3" />
                    <div className="h-6 w-3/4 bg-muted-foreground/20 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : items.length > 0 ? (
              items.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item.id === selectedItem ? null : item.id)}
                  className={`group flex-shrink-0 w-[280px] snap-start cursor-pointer border rounded-3xl bg-card transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] relative overflow-hidden ${
                    selectedItem === item.id ? "border-primary shadow-[0_0_0_2px_rgba(var(--primary),0.3)] ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-border/50 hover:border-primary/30"
                  }`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-3xl bg-muted/40">
                    <ImageWithSkeleton 
                      src={item.image} 
                      alt={item.name || item.brand || 'Clothing Item'} 
                      className="transition-transform duration-700 group-hover:scale-105 w-full h-full object-cover" 
                      imgClassName="group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col items-center justify-center p-4">
                      <span className="text-white text-xs font-bold uppercase tracking-wider mb-3 px-3 py-1 border border-white/40 rounded-full backdrop-blur-md">
                        {item.category || item.brand || 'Style'}
                      </span>
                      <Button className="w-full bg-white text-black hover:bg-primary hover:text-white transition-all shadow-xl font-bold rounded-xl" size="sm">
                        Try On Item
                      </Button>
                    </div>
                    
                    <button className="absolute top-4 right-4 z-20 w-10 h-10 bg-background/50 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-white hover:text-rose-500 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 shadow-sm border border-border/50">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="max-w-[70%]">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 line-clamp-1">{item.brand || item.category}</p>
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1" title={item.name}>{item.name}</h3>
                      </div>
                      <span className="font-display font-medium text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {item.price ? (typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price) : "$--"}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`absolute inset-0 rounded-3xl border-2 border-transparent transition-colors duration-300 pointer-events-none ${selectedItem === item.id ? 'border-primary' : ''}`} />
                </div>
              ))
            ) : (
               <div className="w-full py-12 flex justify-center items-center text-muted-foreground gap-3">
                 <p className="font-medium">No items found for this category.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-center md:hidden">
          <Button variant="outline" className="border-primary/20 hover:border-primary/50 w-full sm:w-auto items-center rounded-full group" asChild>
            <Link to="/browse">
              View All Collection <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
