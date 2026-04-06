import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import { FitPredictionCard } from './FitPredictionCard';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface FitPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  garment: any;
  size: string;
  onSizeChange: (size: string) => void;
  fitResults: any;
  loading: boolean;
  onTryFit: () => void;
}

export const FitPredictionModal: React.FC<FitPredictionModalProps> = ({
  isOpen,
  onClose,
  garment,
  size,
  onSizeChange,
  fitResults,
  loading,
  onTryFit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-white p-0 border-0 shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row [&>button]:hidden">
        <DialogTitle className="sr-only">Fit Analysis</DialogTitle>
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={onClose}
            className="bg-white/60 hover:bg-white p-2 border border-gray-100 rounded-full transition-colors shadow-sm focus:outline-none"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Left Side: Product preview & Size Selection */}
        <div className="md:w-2/5 bg-gray-50 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
          <div className="w-full aspect-[3/4] bg-white rounded-xl shadow-sm mb-6 overflow-hidden flex items-center justify-center border border-gray-200">
            {garment?.image || garment?.image_url ? (
              <img 
                src={garment.image || garment.image_url} 
                alt={garment.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>
          
          <h3 className="text-xl font-bold font-serif mb-2 text-center text-slate-800">
            {garment?.name || 'Selected Garment'}
          </h3>
          <p className="text-gray-500 mb-6 text-sm text-center uppercase tracking-wider font-semibold">
            {garment?.brand || garment?.category}
          </p>

          <div className="w-full mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Select Size</label>
            <div className="grid grid-cols-3 gap-2">
              {(garment?.specifications?.sizes ? Object.keys(garment.specifications.sizes) : ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map(s => (
                <button
                  key={s}
                  onClick={() => onSizeChange(s)}
                  className={`py-2 px-1 rounded-lg border font-semibold text-sm transition-all ${
                    size === s 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => {
              onClose();
              onTryFit();
            }}
            disabled={loading || !fitResults?.fit_prediction}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
          >
            Try Fit on Avatar
          </button>
        </div>

        {/* Right Side: High-Fidelity Fit Prediction Card */}
        <div className="md:w-3/5 bg-gray-100 p-6 md:p-8 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-xl relative">
            {!fitResults?.fit_prediction && loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-gray-500 animate-pulse font-medium">Analyzing body measurements & garment data...</p>
              </div>
            ) : !fitResults?.fit_prediction ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">📏</span>
                </div>
                <h3 className="text-lg font-bold text-gray-700">Ready to Analyze</h3>
                <p className="text-gray-500 max-w-xs text-sm">Select a size on the left to generate your personalized fit report.</p>
              </div>
            ) : (
              <div className={`transition-opacity duration-300 relative ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                {loading && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                    <div className="bg-white/80 p-3 rounded-full shadow-lg">
                      <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                  </div>
                )}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <FitPredictionCard 
                    garment={garment}
                    size={size}
                    fitData={fitResults}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
