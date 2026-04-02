import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppNavbar } from "@/components/AppNavbar";
import HomePage from "./pages/HomePage";
import FittingRoomPage from "./pages/FittingRoomPage";
import BrowsePage from "./pages/BrowsePage";
import SizeGuidePage from "./pages/SizeGuidePage";
import MobileCapturePage from "./pages/MobileCapturePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppNavbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fitting-room" element={<FittingRoomPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/mobile-capture" element={<MobileCapturePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
