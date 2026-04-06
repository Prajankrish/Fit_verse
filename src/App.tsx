import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppNavbar } from "@/components/AppNavbar";
import { FittingRoomProvider } from "@/contexts/FittingRoomContext";
import HomePage from "./pages/HomePage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FittingRoomPage from "./pages/FittingRoomPage";
import BrowsePage from "./pages/BrowsePage";
import SizeGuidePage from "./pages/SizeGuidePage";
import MobileCapturePage from "./pages/MobileCapturePage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FitProvider, FitModal } from "@/components/FitPredictionSystem";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FitProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <FittingRoomProvider>
          <AppNavbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/size-guide" element={<SizeGuidePage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/fitting-room" element={<FittingRoomPage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/mobile-capture" element={<MobileCapturePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </FittingRoomProvider>
        <FitModal />
      </BrowserRouter>
     </FitProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
