import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Loader2, InfoIcon, Sparkles, Search } from 'lucide-react';
import { api, Garment } from '../utils/api';

interface GarmentGridProps {
  measurementId?: number;
  onSelectGarment: (garment: Garment, size: string) => void;
  loading?: boolean;
  categoryFilter?: string;
}

export const GarmentGrid: React.FC<GarmentGridProps> = ({
  measurementId,
  onSelectGarment,
  loading = false,
  categoryFilter,
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
  }, [categoryFilter, searchQuery]);

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
      
      const response = await api.getGarments(LIMIT, currentPage * LIMIT, searchQuery, categoryFilter === 'all' ? '' : categoryFilter || '');
      
      setGarments(prev => reset ? response.garments : [...prev, ...response.garments]);
      setTotal(response.total);

      // Enhance default states
      const newSizes: Record<string, string> = reset ? {} : { ...selectedSizes };
      const newConfidence: Record<string, number> = reset ? {} : { ...fitConfidence };

      response.garments.forEach((g) => {
        let confidence = 60;
        if (g.target_body_types && g.target_body_types.length > 0) confidence += 15;
        if (g.stretch_percentage && g.stretch_percentage > 0) confidence += Math.min(15, g.stretch_percentage / 5);
        newConfidence[g.id] = Math.min(95, confidence);
        if (!newSizes[g.id]) newSizes[g.id] = 'M';
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
    if (measurementId) {
      onSelectGarment(garment, size);
    } else {
      toast.error('Please complete Body Analysis first to check fit sizing');
    }
  };

  const handlePredictFit = (garment: Garment) => {
    if (!measurementId) {
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
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading products...</p>
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
                  className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${!measurementId ? "border opacity-90" : "border-border/50"}`}
                >
                  <div className="aspect-[3/4] w-full bg-gray-100 relative overflow-hidden">
                    <img 
                      src={garment.image || `https://source.unsplash.com/random/400x500/?${garment.category},fashion&${garment.id}`}
                      alt={garment.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=400&h=500';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                       <Badge className="font-bold bg-white/90 text-black border border-gray-200 shadow-sm backdrop-blur-sm">
                         ${garment.price?.toFixed(2) || '29.99'}
                       </Badge>
                       {measurementId && fitConfidence[garment.id] > 0 && (
                         <Badge className={`font-semibold shadow-md backdrop-blur-md border ${fitConfidence[garment.id] >= 85 ? 'bg-emerald-500/90 text-white border-emerald-400' : fitConfidence[garment.id] >= 75 ? 'bg-blue-500/90 text-white border-blue-400' : 'bg-amber-500/90 text-white border-amber-400'}`}>
                           {fitConfidence[garment.id] >= 85 ? (
                             <Sparkles className="w-3 h-3 mr-1 inline" />
                           ) : null}
                           {fitConfidence[garment.id]}% Match
                         </Badge>
                       )}
                    </div>
                    
                    {/* Tags at bottom of image */}
                    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5 opacity-90">
                      {garment.stretch_percentage > 5 && (
                        <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                          High Stretch
                        </span>
                      )}
                      {measurementId && fitConfidence[garment.id] >= 80 && (
                        <span className="text-[10px] bg-gradient-to-r from-violet-600/80 to-purple-600/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                          Recommended
                        </span>
                      )}
                    </div>
                    
                    {/* Try On Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                      <Button 
                        onClick={() => handlePredictFit(garment)}
                        className="w-full max-w-[160px] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl bg-white text-black hover:bg-gray-100"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Sparkles className="w-4 h-4 mr-2"/>}
                        Try On
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-3.5 space-y-2.5">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1" title={garment.name}>{garment.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{garment.brand || 'Generic Brand'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        className="w-full text-xs rounded-md border border-input bg-background/50 px-2 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                        value={selectedSizes[garment.id] || "M"}
                          onChange={(e) => handleSizeChange(garment, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {Object.keys(garment.specifications?.sizes || {}).map((size) => (
                          <option key={size} value={size}>Size {size}</option>
                        ))}
                      </select>
                    </div>
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
