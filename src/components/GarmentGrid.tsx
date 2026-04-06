import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Loader2, InfoIcon, Sparkles, Search } from 'lucide-react';
import { api, Garment } from '../utils/api';
import { toast } from 'sonner';

interface GarmentGridProps {
  measurementId?: number;
  userMeasurements?: any;
  onSelectGarment: (garment: Garment, size: string) => void;
  loading?: boolean;
  categoryFilter?: string;
  genderFilter?: string;
  selectedGarment?: Garment | null;
}

export const GarmentGrid: React.FC<GarmentGridProps> = ({
  measurementId,
  userMeasurements,
  onSelectGarment,
  loading = false,
  categoryFilter,
  genderFilter,
}) => {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [fitConfidence, setFitConfidence] = useState<Record<string, number>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const LIMIT = 50;

  // Reload completely on filter or search change
  useEffect(() => {
    setPage(0);
    loadGarments(true, 0);
  }, [categoryFilter, genderFilter, searchQuery]);

  // Append on page change when page > 0
  useEffect(() => {
    if (page > 0) {
      loadGarments(false, page);
    }
  }, [page]);

  const loadGarments = async (reset: boolean = false, currentPage: number = 0) => {
    try {
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);
      
      setError(null);
      
      const normalizedCategory = categoryFilter ? categoryFilter.toLowerCase() : '';
      const finalCategory = normalizedCategory === 'all' ? '' : normalizedCategory;
      
      // Convert gender filter to API format
      let finalGender = '';
      if (genderFilter) {
        const genderLower = genderFilter.toLowerCase();
        if (genderLower === 'men') finalGender = 'male';
        else if (genderLower === 'women') finalGender = 'female';
        else if (genderLower === 'unisex') finalGender = 'unisex';
      }
      
      console.log('[GarmentGrid] Fetching garments from backend...', { 
        limit: LIMIT, 
        offset: currentPage * LIMIT, 
        search: searchQuery, 
        category: finalCategory,
        gender: finalGender
      });
      const response = await api.getGarments(LIMIT, currentPage * LIMIT, searchQuery, finalCategory, finalGender);
      console.log('[GarmentGrid] Backend response received:', { 
        count: response.garments?.length || 0, 
        total: response.total 
      });
      
      setGarments(prev => reset ? response.garments : [...prev, ...response.garments]);
      setTotal(response.total);

      // Enhance default states
      const newSizes: Record<string, string> = reset ? {} : { ...selectedSizes };
      const newConfidence: Record<string, number> = reset ? {} : { ...fitConfidence };

      response.garments.forEach((g) => {
        let match_score = 60;
        
        if (!newSizes[g.id]) newSizes[g.id] = 'M';
        
        if (userMeasurements) {
          // Approximate fit score
          const sizeData = g.specifications?.sizes?.[newSizes[g.id]] || {};
          const chest_diff = Math.abs((userMeasurements.chest || userMeasurements.bust || 90) - (sizeData.chest_width || 90));
          const waist_diff = Math.abs((userMeasurements.waist || 70) - (sizeData.waist || 70));
          let fit_score = Math.max(0, 100 - (chest_diff * 2 + waist_diff * 2));
          
          if (g.stretch_percentage) fit_score += g.stretch_percentage / 2; // Stretch compensation
          fit_score = Math.min(100, fit_score);
          
          // Basic Category match
          let category_match = 50;
          if (g.target_body_types?.includes(userMeasurements.body_type)) category_match = 100;
          
          // Simplified Color match
          let color_match = 70; // Assumed default if no deep parsing
          
          match_score = (fit_score * 0.6) + (color_match * 0.2) + (category_match * 0.2);
        } else {
          // Fallback if no measurements
          if (g.target_body_types && g.target_body_types.length > 0) match_score += 15;
          if (g.stretch_percentage && g.stretch_percentage > 0) match_score += Math.min(15, g.stretch_percentage / 5);
        }
        
        newConfidence[g.id] = Math.min(99, Math.round(match_score));
      });

      setFitConfidence(newConfidence);
      setSelectedSizes(newSizes);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load garments';
      setError(message);
      console.error('Error loading garments:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSizeChange = (garment: Garment, size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [garment.id]: size,
    }));
    
    // Automatically trigger fit prediction when size is changed
    if (userMeasurements || measurementId) {
      onSelectGarment(garment, size);
    } else {
      toast.error('Please complete Body Analysis first to check fit sizing');
    }
  };

  const handlePredictFit = (garment: Garment) => {
    if (!userMeasurements && !measurementId) {
      toast.error('Please complete Body Analysis first');
      return;
    }
    const size = selectedSizes[garment.id] || 'M';
    onSelectGarment(garment, size);
  };

  if (error && garments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div>
                <p className="font-medium">Failed to load garments</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => loadGarments(true, 0)} className="w-full">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasMore = garments.length < total;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Products Catalog</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Showing {garments.length} of {total} products
            </p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {!measurementId && (
          <Alert className="bg-blue-50/50 border-blue-200 text-blue-800">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Upload a photo first to get personalized fit predictions.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse py-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-muted/40 rounded-2xl h-80 border border-border/50">
                <div className="h-48 bg-muted/60 rounded-t-2xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : garments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {garments.map((garment) => (
                <Card 
                  key={garment.id} 
                  className={`group relative rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/20 cursor-pointer ${(!userMeasurements && !measurementId) ? "border-border/40 opacity-90 glass-panel" : "border-border/50 glass-panel hover:border-primary/40"}`}
                >
                  <div className="aspect-[3/4] w-full bg-muted/30 relative overflow-hidden">
                    <img 
                        src={(garment as any).image || garment.image_url || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80`}
                      alt={garment.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=400&h=500';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2 items-end z-10">
                       <Badge className="font-extrabold bg-white/95 text-black border border-gray-200/50 shadow-md backdrop-blur-md px-2.5 py-1 text-xs">
                         ${garment.price?.toFixed(2) || '29.99'}
                       </Badge>
                       {(userMeasurements || measurementId) && fitConfidence[garment.id] > 0 && (
                         <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold shadow-lg backdrop-blur-md border ${fitConfidence[garment.id] >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/50' : fitConfidence[garment.id] >= 75 ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400/50' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/50'}`}>
                           {fitConfidence[garment.id] >= 85 ? (
                             <Sparkles className="w-3.5 h-3.5" />
                           ) : null}
                           <span className="text-[11px] leading-none">{fitConfidence[garment.id]}% Match</span>
                         </div>
                       )}
                    </div>
                    
                    {/* Tags at bottom of image */}
                    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5 opacity-90">
                      {garment.stretch_percentage > 5 && (
                        <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                          High Stretch
                        </span>
                      )}
                      {(userMeasurements || measurementId) && fitConfidence[garment.id] >= 90 && (
                        <span className="text-[10px] bg-gradient-to-r from-emerald-600/80 to-green-600/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm border border-emerald-400 font-semibold">
                          ✓ Best Fit Match
                        </span>
                      )}
                      {(userMeasurements || measurementId) && fitConfidence[garment.id] >= 80 && fitConfidence[garment.id] < 90 && (
                        <span className="text-[10px] bg-gradient-to-r from-blue-600/80 to-indigo-600/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm border border-blue-400 font-semibold">
                          Recommended for you
                        </span>
                      )}
                    </div>
                    
                    {/* Try On Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 backdrop-blur-sm z-20">
                      <Button 
                        onClick={() => handlePredictFit(garment)}
                        className="w-full max-w-[160px] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl gradient-coral-teal text-white border-0 font-semibold h-11 rounded-xl"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <Sparkles className="w-5 h-5 mr-2"/>}
                        Try On Virtual
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3 bg-background/80 backdrop-blur-md">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2" title={garment.name}>{garment.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{garment.brand || 'Generic Brand'}</p>
                      <p className="text-sm font-bold text-primary mt-1">${garment.price?.toFixed(2) || '29.99'}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Size</label>
                      <select
                        className="w-full text-xs rounded-lg border border-input bg-background/50 px-2 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium"
                        value={selectedSizes[garment.id] || "M"}
                        onChange={(e) => handleSizeChange(garment, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {Object.keys(garment.specifications?.sizes || {}).length > 0 
                          ? Object.keys(garment.specifications?.sizes || {}).map((size) => (
                              <option key={size} value={size}>Size {size}</option>
                            ))
                          : ["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                              <option key={size} value={size}>Size {size}</option>
                            ))
                        }
                      </select>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full rounded-lg shadow-md h-9 font-semibold"
                      onClick={() => handlePredictFit(garment)}
                      disabled={loading}
                      variant="default"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Try On
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {hasMore && (
              <div className="pt-6 pb-2 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={isLoadingMore}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  {isLoadingMore ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                  Load More Products
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
