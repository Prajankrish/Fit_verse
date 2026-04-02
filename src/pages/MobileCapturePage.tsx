import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const backendPort = '8000';
const API_BASE_URL = (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost'))
  ? import.meta.env.VITE_API_URL
  : `${window.location.protocol}//${window.location.hostname}:${backendPort}`;

export default function MobileCapturePage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid session. Scan the QR code again.");
      return;
    }
    startCamera();

    return () => {
      stopCamera();
    };
  }, [sessionId]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Camera access denied or not available. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            setImageBlob(blob);
            setHasPhoto(true);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const retakePhoto = () => {
    setHasPhoto(false);
    setImageBlob(null);
  };

  const uploadPhoto = async () => {
    if (!imageBlob || !sessionId) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('file', imageBlob, 'capture.jpg');

      const response = await fetch(`${API_BASE_URL}/api/v1/upload-mobile-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      toast.success("Photo uploaded successfully! Check your laptop.");
      setTimeout(() => {
         window.close(); // might not work on mobile, but just in case
      }, 3000);
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Mobile Capture</h1>
          <p className="text-gray-400">
            {hasPhoto ? "Review your photo" : "Position yourself in the frame and capture"}
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[3/4] border border-gray-800 shadow-2xl flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`absolute inset-0 w-full h-full object-cover ${hasPhoto ? 'hidden' : 'block'}`}
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-cover ${hasPhoto ? 'block' : 'hidden'}`}
          />
          
          {!hasPhoto && !error && (
             <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/30 m-8 rounded-xl opacity-50"></div>
          )}
        </div>

        {sessionId && !error && (
          <div className="flex justify-center gap-4 pt-4">
            {!hasPhoto ? (
              <Button 
                onClick={takePhoto} 
                size="lg" 
                className="w-full h-16 rounded-full text-lg bg-indigo-600 hover:bg-indigo-700"
              >
                <Camera className="mr-2 h-6 w-6" /> Take Photo
              </Button>
            ) : (
              <div className="flex w-full gap-4">
                <Button 
                  onClick={retakePhoto} 
                  variant="outline" 
                  size="lg"
                  disabled={uploading}
                  className="flex-1 h-14 text-black"
                >
                  <RefreshCw className="mr-2 h-5 w-5" /> Retake
                </Button>
                <Button 
                  onClick={uploadPhoto} 
                  size="lg"
                  disabled={uploading}
                  className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700"
                >
                  {uploading ? (
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Upload className="mr-2 h-5 w-5" />
                  )}
                  {uploading ? "Uploading..." : "Use Photo"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
