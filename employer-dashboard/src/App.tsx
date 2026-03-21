import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("sb_token", token);
      console.log("Token received:", token);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/employer">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) return;

  localStorage.setItem("sb_token", token);

  const fetchEmployer = async () => {
    const { createClient } = await import("@supabase/supabase-js");

    const supabase = createClient(
      "https://ispbevvwwggbktfczmui.supabase.co",
      "sb_publishable_5pnSaiKllm-q7UNMe5r7pw_n4Qu-AJ7"
    );

    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) return;

    const { data: employer } = await supabase
      .from("employers")
      .select("employer_id")
      .eq("user_id", user.id)
      .single();

    if (employer) {
      localStorage.setItem("employer_id", employer.employer_id);
      console.log("Employer ID:", employer.employer_id);
    }
  };

  fetchEmployer();
}, []);
export default App;