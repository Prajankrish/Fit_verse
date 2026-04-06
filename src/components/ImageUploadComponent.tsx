import React, { useState, useRef } from 'react';
import { Upload, X, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { useBodyAnalysis } from '../hooks/useBodyAnalysis';
import QRCode from 'react-qr-code';

interface ImageUploadComponentProps {
  onAnalysisComplete: (data: any) => void;
  onAnalyzing?: (status: boolean) => void;
  onAnalysisStep?: (step: string | null) => void;
  disabled?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function ImageUploadComponent({
  onAnalysisComplete,
  onAnalyzing,
  onAnalysisStep,
  disabled
}: ImageUploadComponentProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisStep, setAnalysisStepState] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyze, loading } = useBodyAnalysis();

  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [pollingInterval, setCustomPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const updateStep = (step: string | null) => {
    setAnalysisStepState(step);
    if(onAnalysisStep) onAnalysisStep(step);
  };

  const handleMobileCamera = () => {
    const newSessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    
    const hostUrl = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    const mobileCaptureUrl = `${hostUrl}/mobile-capture?sessionId=${newSessionId}`;
    setQrUrl(mobileCaptureUrl);
    setShowQR(true);

    if (pollingInterval) clearInterval(pollingInterval);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/check-mobile-image?sessionId=${newSessionId}`);
        if (res.ok) {
           const data = await res.json();
           if (data.status === 'ready') {
             clearInterval(interval);
             setShowQR(false);
             
             const imgRes = await fetch(`${API_BASE_URL}/api/v1/get-mobile-image?sessionId=${newSessionId}`);
             const blob = await imgRes.blob();
             const file = new File([blob], 'mobile_capture.jpg', { type: 'image/jpeg' });
             
             const reader = new FileReader();
             reader.onload = (e) => setPreview(e.target?.result as string);
             reader.readAsDataURL(file);

             handleAnalyze(file);
           }
        }
      } catch (e) {
        // ignore network error while polling
      }
    }, 2500);
    setCustomPollingInterval(interval);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    handleAnalyze(file);
  };

  const handleAnalyze = async (file: File) => {
    try {
      if (onAnalyzing) onAnalyzing(true);
      
      const steps = ['upload', 'detect', 'classify', 'measure', 'skin'];
      for (let i = 0; i < steps.length - 1; i++) {
        updateStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      updateStep('classify');
      // Removed email input so strictly analyzing
      const result = await analyze(file, undefined);
      
      if (result) {
        updateStep('complete');
        await new Promise(resolve => setTimeout(resolve, 500));
        onAnalysisComplete(result);
      } else {
        updateStep(null);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      updateStep(null);
    } finally {
      if (onAnalyzing) onAnalyzing(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({
          target: { files: dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  return (
    <div className={`w-full relative transition-all duration-300 ${disabled ? 'opacity-50 pointer-events-none filter grayscale' : ''}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-all duration-300 cursor-pointer min-h-[240px] flex flex-col items-center justify-center
        ${
          preview
            ? 'border-transparent bg-transparent p-0'
            : 'border-primary/30 bg-card hover:border-primary/60 hover:bg-primary/5 hover:shadow-md'
        }`}
        onClick={() => {
          if (!preview && !showQR && !loading) fileInputRef.current?.click();
        }}
      >
        {preview ? (
           <div className="relative w-full aspect-[3/4] max-h-[300px] rounded-2xl overflow-hidden shadow-lg group">
             <img src={preview} alt="Upload preview" className={`w-full h-full object-cover transition-all duration-500 rounded-2xl ${loading ? 'opacity-40 blur-sm scale-110' : 'opacity-100 scale-100'}`} />
             {!loading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); setPreview(null); updateStep(null); }} className="rounded-full shadow-xl">
                      <X className="w-5 h-5" />
                   </Button>
                </div>
             )}
             
             {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 z-10">
                   <div className="bg-background/90 backdrop-blur-md p-4 rounded-2xl flex flex-col items-center shadow-xl border border-border/50">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                      <p className="text-sm font-bold text-foreground animate-pulse">
                        {analysisStep === 'upload' ? 'Uploading...' :
                         analysisStep === 'detect' ? 'Detecting Pose...' :
                         analysisStep === 'measure' ? 'Extracting Measurements...' :
                         analysisStep === 'skin' ? 'Analyzing Skin Tone...' :
                         'Processing...'}
                      </p>
                   </div>
                </div>
             )}
             
             {analysisStep === 'complete' && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-emerald-500/20 backdrop-blur-[2px]">
                   <div className="bg-emerald-500 text-white rounded-full p-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-[bounce_1s_ease-in-out_infinite]">
                     <CheckCircle2 className="w-8 h-8" />
                   </div>
                </div>
             )}
           </div>
        ) : (
           <>
             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5 text-primary shadow-inner">
               <Upload className="w-7 h-7 group-hover:-translate-y-1 transition-transform" />
             </div>
             <h3 className="text-lg font-bold text-foreground mb-1 tracking-tight">Drag and drop your photo</h3>
             <p className="text-sm text-muted-foreground mb-6">High quality, full-body shot</p>
             
             <div className="grid grid-cols-1 gap-3 w-full max-w-[200px] z-10 relative">
               <Button 
                 variant="default" 
                 size="sm"
                 className="w-full bg-gradient-to-r from-primary to-secondary shadow-md text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all"
                 onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
               >
                 <Upload className="w-4 h-4 mr-2" /> Browse Device
               </Button>
               <Button 
                 variant="outline" 
                 size="sm"
                 className="w-full border-primary/20 hover:border-primary/50 text-foreground rounded-xl"
                 onClick={(e) => { e.stopPropagation(); handleMobileCamera(); }}
               >
                 <Smartphone className="w-4 h-4 mr-2 text-primary" /> Use Phone Camera
               </Button>
             </div>
           </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
      </div>

      {showQR && (
        <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
           <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => setShowQR(false)}>
             <X className="w-5 h-5" />
           </Button>
           <div className="p-4 bg-white rounded-2xl shadow-inner border mb-4">
             <QRCode value={qrUrl} size={160} />
           </div>
           <h4 className="font-bold mb-1 text-center">Scan to Upload</h4>
           <div className="flex items-center gap-2 text-xs font-semibold text-primary animate-pulse bg-primary/10 px-3 py-1.5 rounded-full">
             <Loader2 className="w-3.5 h-3.5 animate-spin" /> Awaiting upload...
           </div>
        </div>
      )}
    </div>
  );
}
