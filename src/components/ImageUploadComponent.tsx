import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Upload, CheckCircle, Clock, Smartphone, X } from 'lucide-react';
import { useBodyAnalysis } from '../hooks/useBodyAnalysis';
import QRCode from 'react-qr-code';

interface ImageUploadComponentProps {
  onAnalysisComplete: (data: any) => void;
  disabled?: boolean;
}

const backendPort = '8000';
const API_BASE_URL = (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost'))
  ? import.meta.env.VITE_API_URL
  : `${window.location.protocol}//${window.location.hostname}:${backendPort}`;

export const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  onAnalysisComplete,
  disabled = false,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [analysisStep, setAnalysisStep] = useState<string | null>(null);
  const [analysisQuality, setAnalysisQuality] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyze, loading, error } = useBodyAnalysis();

  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const analysisSteps = [
    { id: 'upload', label: 'Uploading photo', icon: '📦' },
    { id: 'detect', label: 'Detecting body position', icon: '🔍' },
    { id: 'classify', label: 'Classifying body type', icon: '📊' },
    { id: 'measure', label: 'Estimating measurements', icon: '📏' },
    { id: 'skin', label: 'Analyzing skin tone', icon: '🎨' },
    { id: 'complete', label: 'Analysis complete', icon: '✅' }
  ];

  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const handleMobileCamera = () => {
    const newSessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    
    // Create the URL assuming the app is running on the same network
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
             
             // Fetch the actual image
             const imgRes = await fetch(`${API_BASE_URL}/api/v1/get-mobile-image?sessionId=${newSessionId}`);
             const blob = await imgRes.blob();
             const file = new File([blob], 'mobile_capture.jpg', { type: 'image/jpeg' });
             
             // Show preview
             const reader = new FileReader();
             reader.onload = (e) => setPreview(e.target?.result as string);
             reader.readAsDataURL(file);

             // Process image
             setAnalysisStep('upload');
             setAnalysisQuality(null);
             handleAnalyze(file);
           }
        }
      } catch (e) {
        // ignore network error while polling
      }
    }, 2500);
    setPollingInterval(interval);
  };

  const cancelMobileCamera = () => {
    setShowQR(false);
    if (pollingInterval) clearInterval(pollingInterval);
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

    setAnalysisStep('upload');
    setAnalysisQuality(null);
    handleAnalyze(file);
  };

  const handleAnalyze = async (file: File) => {
    try {
      const steps = ['upload', 'detect', 'classify', 'measure', 'skin'];
      for (let i = 0; i < steps.length - 1; i++) {
        setAnalysisStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setAnalysisStep('classify');
      const result = await analyze(file, email || undefined);
      
      if (result) {
        setAnalysisQuality(result.quality_indicators);
        setAnalysisStep('complete');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        onAnalysisComplete(result);
      } else {
        setAnalysisStep(null);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisStep(null);
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

  const getQualityColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-blue-600';
    if (confidence >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          preview || showQR
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => {
          if (!disabled && !showQR) fileInputRef.current?.click();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || loading || showQR}
        />

        {showQR ? (
          <div className="space-y-4 flex flex-col items-center">
            <h3 className="font-semibold text-lg text-indigo-900">Scan to capture</h3>
            <p className="text-sm text-gray-500 max-w-[250px]">Point your phone's camera at this QR code to take a full-body photo.</p>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <QRCode value={qrUrl} size={180} />
            </div>
            
            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full mt-4">
               <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-sm font-medium">Waiting for mobile upload...</span>
            </div>

            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); cancelMobileCamera(); }} className="text-gray-500 mt-2 hover:bg-white z-10 relative pointer-events-auto">
              Cancel
            </Button>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded mb-4" />
            
            {/* Analysis Progress */}
            {loading && analysisStep && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-blue-900">Analyzing your photo...</p>
                <div className="space-y-2">
                  {analysisSteps.map((step) => {
                    const isCompleted = analysisSteps.findIndex(s => s.id === analysisStep) >= analysisSteps.findIndex(s => s.id === step.id) && analysisStep !== step.id;
                    const isCurrent = analysisStep === step.id;
                    
                    return (
                      <div key={step.id} className="flex items-center gap-2 text-sm">
                        {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {isCurrent && <Clock className="w-4 h-4 text-blue-600 animate-spin" />}
                        {!isCompleted && !isCurrent && <div className="w-4 h-4 rounded-full border border-gray-300" />}
                        <span className={isCurrent ? 'font-semibold text-blue-700' : isCompleted ? 'text-gray-600' : 'text-gray-500'}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Quality Indicators */}
            {!loading && analysisQuality && (
              <div className="bg-green-50 rounded-lg p-4 space-y-2 text-left">
                <p className="text-sm font-semibold text-green-900">✅ Analysis Quality</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Body Type Detection:</span>
                    <span className={`font-semibold ${getQualityColor(analysisQuality.body_type_confidence || 0)}`}>
                      {analysisQuality.body_type_confidence || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Skin Tone Analysis:</span>
                    <span className={`font-semibold ${getQualityColor(analysisQuality.skin_tone_confidence || 0)}`}>
                      {analysisQuality.skin_tone_confidence || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Overall Quality:</span>
                    <span className={`font-semibold ${getQualityColor(analysisQuality.overall_quality || 0)}`}>
                      {analysisQuality.overall_quality || 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!loading && (
              <p className="text-sm text-gray-600">
                Ready to browse garments. Review measurements above if needed.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="pointer-events-none space-y-3 mb-6">
              <Upload className="w-10 h-10 mx-auto text-indigo-400" />
              <div>
                <p className="text-gray-800 font-semibold text-base tracking-tight">Drag and drop your photo here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse files from your device</p>
              </div>
              <div className="pt-1">
                <span className="inline-block bg-gray-50 text-gray-500 text-[11px] font-medium px-3 py-1 rounded-full border border-gray-200">
                  JPG, PNG up to 10MB • Full body shot
                </span>
              </div>
            </div>

            <div className="w-full max-w-[280px] relative z-10">
              <div className="relative flex items-center justify-center mb-5 pointer-events-none">
                <div className="border-t border-gray-200 w-full" />
                <div className="absolute bg-white px-3 text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Or
                </div>
              </div>

              <div
                className="flex items-center w-full p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/80 shadow-sm transition-all cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMobileCamera();
                }}
              >
                <div className="bg-white p-2.5 rounded-lg shadow-sm border border-indigo-100 group-hover:scale-105 transition-transform flex-shrink-0 mr-3">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-indigo-900 text-sm">Take photo with phone</span>
                  <span className="text-indigo-600/70 text-[11px] mt-0.5 leading-tight">Scan a QR code to capture</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Input */}
      <input
        type="email"
        placeholder="Enter email to save results (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={disabled || loading || showQR}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-shadow shadow-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
      />

      {/* Action Buttons - Only show if preview is present (since we moved initial buttons to the dropzone) */}
      {!showQR && preview && (
        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || loading}
            className="flex-1 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm rounded-xl py-6 font-medium"
            variant="outline"
          >
            {loading ? 'Analyzing...' : 'Upload Different Photo'}
          </Button>
        </div>
      )}

      {/* Action Buttons fallback for loading state if needed */}
      {!showQR && !preview && loading && (
         <div className="flex gap-3 mt-4">
           <Button
             disabled={true}
             className="flex-1 rounded-xl py-6 font-medium"
           >
             Analyzing...
           </Button>
         </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
