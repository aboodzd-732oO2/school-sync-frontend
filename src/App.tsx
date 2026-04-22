import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DirectionProvider } from "@radix-ui/react-direction";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DirectionProvider dir="rtl">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/submit" element={<Index />} />
            <Route path="/reports" element={<Index />} />
            <Route path="/inventory" element={<Index />} />
            <Route path="/inventory/alerts" element={<Index />} />
            <Route path="/inventory/history" element={<Index />} />
            <Route path="/notifications" element={<Index />} />
            <Route path="/settings" element={<Index />} />
            <Route path="/requests" element={<Index />} />
            <Route path="/requests/active" element={<Index />} />
            <Route path="/requests/history" element={<Index />} />
            <Route path="/drafts" element={<Index />} />
            <Route path="/admin" element={<Index />} />
            <Route path="/admin/*" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DirectionProvider>
  </QueryClientProvider>
);

export default App;
