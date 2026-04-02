import { useState, useEffect } from "react";
import { Loader2, Sparkles, AlertCircle, KeyRound, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AIAvatarGeneratorProps {
  measurements: {
    height: number;
    bust: number;
    waist: number;
    hips: number;
  };
  garment: any | null;
}

export function AIAvatarGenerator({ measurements, garment }: AIAvatarGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem("HF_API_KEY") || "");
  const [isEditingKey, setIsEditingKey] = useState(!localStorage.getItem("HF_API_KEY"));

  const generateAvatar = async () => {
    if (!apiKey) {
      setIsEditingKey(true);
      setError("Please provide a Hugging Face API Token to generate realistic avatars.");
      return;
    }

    setLoading(true);
    setError(null);

    // Build the prompt based on user's exact measurements and selected garment
    const bodyDesc = `Height ${measurements.height}cm, Bust ${measurements.bust}cm, Waist ${measurements.waist}cm, Hips ${measurements.hips}cm`;
    const garmentDesc = garment 
      ? `wearing ${garment.name}, ${garment.category}, ${garment.fabric || 'clothing'}`
      : "wearing basic fitted neutral clothing";

    const prompt = `ultra realistic high fashion studio portrait of a person, ${bodyDesc}, ${garmentDesc}, full body shot, 8k resolution, photorealistic, perfectly fitted, highly detailed`;

    try {
      // Direct call to Hugging Face Free Inference API (FLUX.1-schnell or SDXL)
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) {
        const errDetails = await response.text();
        throw new Error(`Generation failed (${response.status}): ${errDetails.substring(0, 100)}`);
      }

      const blob = await response.blob();
      const newImageUrl = URL.createObjectURL(blob);
      setImageUrl(newImageUrl);
    } catch (err: any) {
      console.error("AI Generation Error", err);
      // Fallback proxy to a placeholder so the UI still looks complete and prevents blocking crashes
      setError(err.message || "Failed to connect to Hugging Face AI.");
      
      // We simulate a fallback so the user can verify the prompt functionality even if their token fails
      setTimeout(() => {
        const seed = garment ? garment.id : Math.floor(Math.random() * 1000);
        setImageUrl(`https://picsum.photos/seed/${seed}/600/800?blur=1`);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const saveKey = () => {
    localStorage.setItem("HF_API_KEY", apiKey);
    setIsEditingKey(false);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 relative z-10 min-h-[500px]">
      
      {/* Settings Modal overlay for API Key */}
      {isEditingKey && (
         <Card className="absolute z-50 w-[90%] max-w-[350px] shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <CardContent className="pt-6 space-y-4">
             <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                <KeyRound size={18} />
                <span>AI API Settings</span>
             </div>
             <p className="text-xs text-muted-foreground">
               To generate hyper-realistic virtual fitting avatars, we use Hugging Face inference. Enter a free access token from huggingface.co to enable.
             </p>
             <div className="space-y-2">
               <Label htmlFor="api_key" className="text-xs">Hugging Face Token</Label>
               <Input 
                 id="api_key"
                 type="password" 
                 placeholder="hf_..." 
                 value={apiKey}
                 onChange={(e) => setApiKey(e.target.value)}
                 className="text-xs"
               />
             </div>
             <Button onClick={saveKey} className="w-full h-8 text-xs">Save & Continue</Button>
             {apiKey && <Button variant="link" onClick={() => setIsEditingKey(false)} className="w-full text-xs h-6">Cancel</Button>}
           </CardContent>
         </Card>
      )}

      {/* Main Display container */}
      <div className="relative w-full h-[500px] flex items-center justify-center rounded-2xl overflow-hidden bg-muted/20 border border-border/40 transition-all duration-500">
        
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-20 transition-opacity">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium animate-pulse bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Synthesizing Realistic Avatar...
            </p>
            <p className="text-xs text-muted-foreground mt-2 max-w-[200px] text-center">
              Generating body (H:{measurements.height}/B:{measurements.bust}) {garment ? 'with ' + garment.name : ''}
            </p>
          </div>
        )}

        {!imageUrl && !loading ? (
          <div className="flex flex-col items-center text-center p-6 opacity-70">
            <Sparkles className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">AI Visualizer</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mb-6">
              Generate a highly realistic rendering of your body type wearing the selected garments using FLUX.1.
            </p>
            <Button onClick={generateAvatar} variant="default" className="rounded-full shadow-lg group">
              <Sparkles className="w-4 h-4 mr-2 group-hover:animate-spin" /> Generate Look
            </Button>
          </div>
        ) : imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt="Generated AI Fitting" 
              className="w-full h-full object-cover shadow-inner object-top transition-opacity duration-1000"
            />
            {/* Control Strip on top of the image */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 shadow-lg drop-shadow-2xl z-30">
               <Button onClick={generateAvatar} variant="secondary" size="sm" className="rounded-full backdrop-blur-md bg-background/60 hover:bg-background/90 text-xs text-foreground shadow-xl border border-white/20">
                 <Sparkles className="w-3 h-3 mr-1" /> Re-generate
               </Button>
               <Button onClick={() => setIsEditingKey(true)} variant="secondary" size="sm" className="rounded-full backdrop-blur-md bg-background/60 hover:bg-background/90 text-xs text-foreground shadow-xl border border-white/20">
                 <KeyRound className="w-3 h-3" />
               </Button>
            </div>
            {error && (
              <div className="absolute top-4 left-4 right-4 bg-destructive/95 text-destructive-foreground text-xs p-3 rounded-lg flex flex-col gap-1 shadow-2xl backdrop-blur-md border border-red-500/20 z-40">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Generating Fallback View...
                </div>
                <p className="flex-1 text-left leading-relaxed opacity-90">{error}</p>
              </div>
            )}
          </>
        ) : null}

      </div>
    </div>
  );
}
