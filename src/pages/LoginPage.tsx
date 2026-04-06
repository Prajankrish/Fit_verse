import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Sparkles, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Decide whether to show login or signup initially based on URL or state
  const isInitialSignUp = new URLSearchParams(location.search).get("mode") === "signup";
  const [isSignUp, setIsSignUp] = useState(isInitialSignUp);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!formData.email || !formData.password || (isSignUp && !formData.name)) {
      toast.error("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      // Store user token in localStorage
      localStorage.setItem("fitverse_user", JSON.stringify({
        id: "usr_" + Math.random().toString(36).substr(2, 9),
        name: isSignUp ? formData.name : (formData.email.split('@')[0] || 'User'),
        email: formData.email
      }));
      
      toast.success(isSignUp ? "Account created successfully!" : "Welcome back!");
      
      // If it's signup, push them directly to onboarding
      if (isSignUp) {
        navigate('/onboarding');
      } else {
        // If login, check if they finished onboarding
        const hasOnboarded = localStorage.getItem("fitverse_onboarding");
        if (!hasOnboarded) {
           navigate('/onboarding');
        } else {
           navigate('/fitting-room');
        }
      }
      
    } catch (err) {
       toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fade-in bg-gradient-to-br from-background via-muted to-primary/5">
      {/* Left side Image/Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-teal-600/40 z-10 mix-blend-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200&h=1000" 
          alt="Fashion Model" 
          className="object-cover w-full h-full opacity-50 transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent z-20 flex flex-col justify-end p-16">
          <div className="max-w-xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-semibold mb-6 border border-white/20">
               <Sparkles className="w-4 h-4" /> The future of fashion
             </div>
             <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
               Your digital <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">Smart Wardrobe</span>
             </h1>
             <p className="text-xl text-white/80 leading-relaxed">Join thousands using our AI engine to discover their perfect fit, explore personalized styles, and try on clothes virtually.</p>
          </div>
        </div>
      </div>

      {/* Right side Auth Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 bg-white/60 backdrop-blur-xl border border-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative z-10 animate-slide-in-right">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-teal-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 text-white font-bold text-xl">
              F
            </div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">
              {isSignUp ? "Create an account" : "Welcome Back"}
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              {isSignUp ? "Enter your details to generate your 3D avatar." : "Log in to access your digital wardrobe."}
            </p>
          </div>
          
          <form className="space-y-5 mt-8" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    className="pl-11 h-14 bg-white/80 border-0 shadow-sm focus-visible:ring-2 focus-visible:ring-primary transition-all rounded-xl font-medium" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  className="pl-11 h-14 bg-white/80 border-0 shadow-sm focus-visible:ring-2 focus-visible:ring-primary transition-all rounded-xl font-medium" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <Label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</Label>
                 {!isSignUp && <a href="#" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">Forgot password?</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="pl-11 h-14 bg-white/80 border-0 shadow-sm focus-visible:ring-2 focus-visible:ring-primary transition-all rounded-xl font-medium" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <Button 
               className="w-full mt-8 h-14 rounded-2xl bg-gradient-to-r from-primary to-teal-500 hover:opacity-90 hover:scale-[1.02] text-white border-0 font-bold shadow-[0_10px_25px_-5px_rgba(var(--primary),0.4)] transition-all duration-300 group" 
               type="submit"
               disabled={isLoading}
            >
              {isLoading ? (
                 <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                 <>
                   {isSignUp ? "Generate Avatar Profile" : "Sign In Securely"}
                   <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                 </>
              )}
            </Button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 font-bold text-muted-foreground bg-[#F7F8FA] uppercase tracking-widest rounded-full border shadow-sm">Or connect with</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full h-14 rounded-2xl bg-white border-border shadow-sm hover:bg-gray-50 transition-all font-semibold" type="button">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-primary hover:text-teal-600 font-bold ml-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              {isSignUp ? "Log in here" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
