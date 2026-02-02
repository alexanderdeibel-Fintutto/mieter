import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import Finanzen from "./pages/Finanzen";
import Chat from "./pages/Chat";
import Mehr from "./pages/Mehr";
import MangelMelden from "./pages/MangelMelden";
import ZaehlerAblesen from "./pages/ZaehlerAblesen";
import DokumentAnfragen from "./pages/DokumentAnfragen";
import Pricing from "./pages/Pricing";
import Success from "./pages/Success";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/registrieren" element={<Register />} />

            {/* Public Routes */}
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/success" element={<Success />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/finanzen" element={<Finanzen />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/mehr" element={<Mehr />} />
              <Route path="/mangel-melden" element={<MangelMelden />} />
              <Route path="/zaehler-ablesen" element={<ZaehlerAblesen />} />
              <Route path="/dokument-anfragen" element={<DokumentAnfragen />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
