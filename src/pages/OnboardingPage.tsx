import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowRight, ArrowLeft, CheckCircle2, Ruler, Weight, User, Droplets, PaintBucket, Sparkles } from "lucide-react";
import { useFittingRoom } from "@/contexts/FittingRoomContext";
import { toast } from "sonner";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setBodyType, setGender, setBodyMeasurements, setUserImage } = useFittingRoom();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [data, setData] = useState({
    gender: 'female',
    height: '170',
    weight: '65',
    bodyType: 'hourglass',
    stylePreference: 'casual',
    skinTone: 'medium',
    photo: null as string | null
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate generation/save
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save to context
    setGender(data.gender);
    setBodyType(data.bodyType);
    setBodyMeasurements({
      height: parseInt(data.height),
      weight: parseInt(data.weight),
      bust: 90, // Defaults for demo
      waist: 70,
      hips: 95
    });
    if (data.photo) setUserImage(data.photo);

    // Save to local storage
    localStorage.setItem("fitverse_onboarding", JSON.stringify(data));
    
    toast.success("Profile created successfully!");
    navigate('/how-it-works');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({...data, photo: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col pt-16 md:pt-20">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-muted fixed top-16 md:top-20 z-40">
        <div 
          className="h-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-500 ease-in-out"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-8 relative">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest rounded-full mb-4 shadow-sm border border-primary/10">
            Step {step} of 5
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-gray-900 mb-3">
            {step === 1 && "Let's build your physical profile"}
            {step === 2 && "Choose your body shape"}
            {step === 3 && "Discover your personal style"}
            {step === 4 && "Select your skin tone"}
            {step === 5 && "Upload a photo for accuracy"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {step === 1 && "This helps our AI generate your accurate 3D avatar."}
            {step === 2 && "We use this to analyze drape and garment fit."}
            {step === 3 && "This powers your customized discovery feed."}
            {step === 4 && "Essential for color matching and styling."}
            {step === 5 && "Optional, but highly recommended for the best AI results."}
          </p>
        </div>

        {/* Step Content */}
        <div className="flex-1 max-w-2xl mx-auto w-full bg-white border border-border/50 shadow-xl shadow-primary/5 rounded-[2rem] p-6 lg:p-10 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

          {step === 1 && (
            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Biological Gender</Label>
                <div className="grid grid-cols-2 gap-4">
                  {['female', 'male'].map(g => (
                    <button
                      key={g}
                      onClick={() => setData({...data, gender: g})}
                      className={`h-16 rounded-xl border-2 font-bold text-lg capitalize transition-all ${
                        data.gender === g 
                          ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                          : 'border-border/50 text-muted-foreground hover:border-border hover:bg-muted/30'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5"/> Height (cm)</Label>
                  <Input 
                    type="number" 
                    value={data.height}
                    onChange={(e) => setData({...data, height: e.target.value})}
                    className="h-14 text-xl font-bold bg-muted/30 border-border/80 rounded-xl px-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Weight className="w-3.5 h-3.5"/> Weight (kg)</Label>
                  <Input 
                    type="number" 
                    value={data.weight}
                    onChange={(e) => setData({...data, weight: e.target.value})}
                    className="h-14 text-xl font-bold bg-muted/30 border-border/80 rounded-xl px-4"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
              {[
                { id: 'hourglass', icon: '⏳' },
                { id: 'pear', icon: '🍐' },
                { id: 'apple', icon: '🍎' },
                { id: 'rectangle', icon: '📏' },
                { id: 'inverted triangle', icon: '🔽' },
                { id: 'oval', icon: '⭕' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setData({...data, bodyType: type.id})}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                    data.bodyType === type.id
                      ? 'border-teal-500 bg-teal-500/5 text-teal-700 shadow-md transform scale-105'
                      : 'border-border/50 text-muted-foreground hover:border-border hover:bg-muted/30'
                  }`}
                >
                  <span className="text-4xl mb-3 filter drop-shadow-sm">{type.icon}</span>
                  <span className="font-bold capitalize text-sm">{type.id}</span>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 relative z-10">
              {[
                { id: 'casual', label: 'Casual & Relaxed', desc: 'Comfortable, everyday wear like jeans and tees.' },
                { id: 'formal', label: 'Formal & Professional', desc: 'Suits, blazers, and sophisticated office styles.' },
                { id: 'streetwear', label: 'Streetwear', desc: 'Urban, trendy, and expressive fashion.' },
                { id: 'minimalist', label: 'Minimalist', desc: 'Clean lines, neutral colors, and subtle elegance.' },
                { id: 'active', label: 'Athleisure', desc: 'Sporty activewear designed for lifestyle comfort.' },
              ].map(style => (
                <div
                  key={style.id}
                  onClick={() => setData({...data, stylePreference: style.id})}
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    data.stylePreference === style.id
                      ? 'border-purple-500 bg-purple-500/5 shadow-md relative'
                      : 'border-border/50 hover:bg-muted/30'
                  }`}
                >
                  <div>
                    <h4 className={`font-bold ${data.stylePreference === style.id ? 'text-purple-700' : 'text-gray-900'}`}>{style.label}</h4>
                    <p className={`text-sm mt-1 ${data.stylePreference === style.id ? 'text-purple-600/80' : 'text-muted-foreground'}`}>{style.desc}</p>
                  </div>
                  {data.stylePreference === style.id && <CheckCircle2 className="w-6 h-6 text-purple-500 absolute right-6" />}
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="relative z-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 'light', color: '#FAD6B1' },
                  { id: 'fair', color: '#E4B98E' },
                  { id: 'medium', color: '#C68E5C' },
                  { id: 'olive', color: '#A06E41' },
                  { id: 'tan', color: '#7E4D26' },
                  { id: 'brown', color: '#5C3317' },
                  { id: 'dark', color: '#3A1E0D' },
                  { id: 'deep', color: '#1E0E06' },
                ].map(tone => (
                  <button
                    key={tone.id}
                    onClick={() => setData({...data, skinTone: tone.id})}
                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                      data.skinTone === tone.id
                        ? 'border-primary shadow-lg ring-4 ring-primary/20 scale-105 bg-white z-10'
                        : 'border-transparent hover:bg-muted/50 hover:scale-105'
                    }`}
                  >
                    <div 
                      className="w-12 h-12 rounded-full mb-3 shadow-inner border border-black/10" 
                      style={{ backgroundColor: tone.color }}
                    />
                    <span className="font-bold text-sm capitalize text-gray-700">{tone.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/70 rounded-3xl bg-muted/10 relative z-10 group hover:border-primary/50 transition-colors">
              {data.photo ? (
                <div className="relative w-48 h-64 rounded-2xl overflow-hidden shadow-lg">
                  <img src={data.photo} className="w-full h-full object-cover" alt="Uploaded Profile" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" onClick={() => document.getElementById('photo-upload')?.click()}>Change Photo</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Upload Full Body Photo</h3>
                  <p className="text-muted-foreground text-center text-sm max-w-sm mb-8">
                    For the most accurate AI measurements and 3D modeling, please upload a well-lit photo wearing form-fitting clothing.
                  </p>
                  <Button size="lg" className="rounded-full shadow-md" onClick={() => document.getElementById('photo-upload')?.click()}>
                    Select from device
                  </Button>
                </>
              )}
              <input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload}
              />
              {data.photo && (
                <Badge className="mt-6 bg-green-500/10 text-green-700 hover:bg-green-500/20 border-0"><CheckCircle2 className="w-4 h-4 mr-1.5"/> Photo Attached</Badge>
              )}
            </div>
          )}
        </div>

        {/* Floating Bottom Nav */}
        <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t p-4 z-40 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="container mx-auto max-w-4xl flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={prevStep}
              className={`rounded-xl h-14 px-6 font-bold text-muted-foreground border-border/80 ${step === 1 ? 'invisible' : ''}`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
            
            {step < 5 ? (
              <Button 
                onClick={nextStep}
                className="rounded-xl h-14 px-8 font-bold bg-gray-900 text-white hover:bg-gray-800 shadow-xl group border-0"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl h-14 px-8 font-bold bg-gradient-to-r from-primary to-teal-500 hover:scale-105 text-white shadow-[0_10px_25px_-5px_rgba(var(--primary),0.4)] transition-all group"
              >
                {isSubmitting ? (
                  <Sparkles className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 mr-3" />
                )}
                {isSubmitting ? "Generating AI Avatar..." : "Complete Profile"}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
