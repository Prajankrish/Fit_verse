import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserCircle, Shield, CreditCard, Ruler, Save, Camera, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'personal';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const storedUser = localStorage.getItem("fitverse_user");
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    } else {
        // Fallback or demo user
        setUser({ name: "Demo User", email: "demo@example.com" });
    }
  }, []);

  const handleSave = () => {
    toast.success("Profile settings updated securely.");
  };

  if (!user) return <div className="h-screen flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="min-h-screen bg-muted/20 pb-16 pt-24 md:pt-32">
      <div className="container mx-auto px-4 max-w-[1000px]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-border/50">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-teal-500 shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-white mix-blend-overlay">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-primary hover:scale-110 transition-transform opacity-0 group-hover:opacity-100">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-foreground">
                {user.name}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1 flex items-center gap-2">
                {user.email || 'user@example.com'}
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">
                  Pro Member
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <Link to="/fitting-room">
                <Button className="rounded-xl shadow-md lg:px-6 h-12 bg-gradient-to-r from-primary to-teal-500 font-bold text-white">
                  <Sparkles className="w-4 h-4 mr-2" /> AI Fitting Room
                </Button>
             </Link>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col md:flex-row gap-8 items-start">
          <TabsList className="flex flex-row md:flex-col justify-start md:w-64 h-auto bg-transparent border-0 space-y-1 p-0 gap-1 overflow-x-auto max-w-full custom-scrollbar flex-nowrap pb-2 md:pb-0 shrink-0">
            <TabsTrigger 
              value="personal" 
              className="rounded-xl px-4 py-3 justify-start min-w-[150px] md:w-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent font-semibold gap-3"
            >
              <UserCircle className="w-5 h-5 opacity-70" /> Personal Info
            </TabsTrigger>
            <TabsTrigger 
              value="measurements" 
              className="rounded-xl px-4 py-3 justify-start min-w-[150px] md:w-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent font-semibold gap-3"
            >
              <Ruler className="w-5 h-5 opacity-70" /> Size & Metrics
            </TabsTrigger>
            <TabsTrigger 
              value="privacy" 
              className="rounded-xl px-4 py-3 justify-start min-w-[150px] md:w-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent font-semibold gap-3"
            >
              <Shield className="w-5 h-5 opacity-70" /> Privacy & Security
            </TabsTrigger>
            <TabsTrigger 
              value="billing" 
              className="rounded-xl px-4 py-3 justify-start min-w-[150px] md:w-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary border border-transparent font-semibold gap-3"
            >
              <CreditCard className="w-5 h-5 opacity-70" /> Billing Details
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 w-full min-h-[500px]">
             {/* Personal Info Tab */}
            <TabsContent value="personal" className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-card px-8 pt-8 pb-6 border-b border-border/50">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <UserCircle className="w-6 h-6 text-indigo-500" /> Account Details
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-2">
                    Update your basic profile information and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6 bg-card/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Full Name</Label>
                      <Input id="name" defaultValue={user.name || "User"} className="h-12 rounded-xl bg-white shadow-sm border-border/40 focus-visible:ring-indigo-500" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Email Address</Label>
                      <Input id="email" type="email" defaultValue={user.email || "user@example.com"} className="h-12 rounded-xl bg-white shadow-sm border-border/40 focus-visible:ring-indigo-500" />
                    </div>
                    <div className="space-y-3 sm:col-span-2">
                      <Label className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="h-12 rounded-xl bg-white shadow-sm border-border/40 focus-visible:ring-indigo-500" />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-border/50 flex justify-end">
                    <Button onClick={handleSave} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200">
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Measurements Tab */}
            <TabsContent value="measurements" className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-card px-8 pt-8 pb-6 border-b border-border/50">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Ruler className="w-6 h-6 text-emerald-500" /> AI Body Profile
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-2">
                    These metrics are used to generate your avatar and predict your fits perfectly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8 bg-card/50">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-emerald-200/50 flex items-center justify-center shrink-0">
                       <Sparkles className="w-5 h-5 text-emerald-600" />
                     </div>
                     <div>
                       <h4 className="font-bold text-emerald-900 mb-1">Your AI Body Twin is Active</h4>
                       <p className="text-sm text-emerald-700/80">
                         We have analyzed your uploads and applied these base metrics to ensure precise sizing across all 3D clothing items in the Fitting Room.
                       </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {['Height', 'Bust/Chest', 'Waist', 'Hips'].map((metric, i) => {
                      const defaults = [170, 92, 74, 96];
                      return (
                        <div key={metric} className="p-4 rounded-2xl bg-white border border-border/50 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                           <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{metric}</Label>
                           <div className="flex items-end gap-1">
                             <Input 
                               defaultValue={defaults[i]} 
                               type="number"
                               className="h-10 px-1 text-xl font-bold border-0 bg-transparent p-0 w-16 focus-visible:ring-0 focus-visible:border-b-2 border-emerald-500 rounded-none shadow-none text-emerald-700" 
                             />
                             <span className="text-muted-foreground font-semibold pb-1">cm</span>
                           </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="pt-6 border-t border-border/50 flex justify-end">
                    <Button onClick={handleSave} className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-200">
                      <Save className="w-4 h-4 mr-2" /> Update Metrics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-card px-8 pt-8 pb-6 border-b border-border/50">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Shield className="w-6 h-6 text-purple-500" /> Data Privacy Control
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-2">
                    Control how your images and measurements are securely stored.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6 bg-card/50">
                  <div className="space-y-6">
                     <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 rounded-2xl bg-white border border-border/50 shadow-sm">
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground">Save Generated Avatars</h4>
                          <p className="text-sm text-muted-foreground mt-1 max-w-sm">Allow FitVerse to cache your secure 3D avatar instances to speed up load times by 80%.</p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-purple-600 mt-2 sm:mt-0" />
                     </div>
                     
                     <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 rounded-2xl bg-white border border-border/50 shadow-sm">
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground">Image Storage Duration</h4>
                          <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-4">We automatically delete uploaded photos. How long should we retain them for fit refinement?</p>
                          
                          <select defaultValue="Retain 30 days (Recommended)" className="flex h-12 w-full max-w-[280px] rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                            <option>Delete immediately after session</option>
                            <option>Retain for 24 hours</option>
                            <option>Retain 30 days (Recommended)</option>
                          </select>
                        </div>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 rounded-2xl bg-red-50/50 border border-red-100 shadow-sm">
                        <div className="flex-1">
                          <h4 className="font-bold text-red-800">Clear All Biometric Data</h4>
                          <p className="text-sm text-red-600/80 mt-1 max-w-sm">Instantly purge all scanning data, photos, avatars, and saved measurements from our secure AWS servers.</p>
                        </div>
                        <Button variant="destructive" className="rounded-xl shadow-sm mt-2 sm:mt-0 font-bold bg-red-600">Purge Data</Button>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-card px-8 pt-8 pb-6 border-b border-border/50">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-orange-500" /> Payment Methods
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-2">
                    Manage your secure 1-click checkout options and subscription.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 bg-card/50 flex flex-col items-center justify-center text-center py-20">
                  <div className="w-24 h-24 bg-orange-100/50 text-orange-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CreditCard className="w-10 h-10" />
                  </div>
                  <h3 className="font-bold text-2xl mb-3 text-foreground">No Saved Cards Yet</h3>
                  <p className="text-muted-foreground max-w-sm mb-10 text-lg">
                    Add a card for seamless checkout from the Fitting Room when you find the perfect style.
                  </p>
                  <Button className="h-14 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-200/50 text-lg">
                    <CreditCard className="w-5 h-5 mr-3" /> Add Secure Payment
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
