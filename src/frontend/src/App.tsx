import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { Footer } from "./components/parish/Footer";
import { LockButton } from "./components/parish/LockButton";
import { Navigation } from "./components/parish/Navigation";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminPage } from "./pages/AdminPage";
import { AktualnosociDetailPage } from "./pages/AktualnosociDetailPage";
import { AktualnosociPage } from "./pages/AktualnosociPage";
import { GaleriaPage } from "./pages/GaleriaPage";
import { HomePage } from "./pages/HomePage";
import { KancelariaPage } from "./pages/KancelariaPage";
import { KontaktPage } from "./pages/KontaktPage";
import { LiturgiaPage } from "./pages/LiturgiaPage";
import { ModlitwaPage } from "./pages/ModlitwaPage";
import { WspolnotyPage } from "./pages/WspolnotyPage";
import { Route, RouterProvider, Routes } from "./router";

function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navigation />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/aktualnosci" element={<AktualnosociPage />} />
          <Route path="/aktualnosci/:id" element={<AktualnosociDetailPage />} />
          <Route path="/liturgia" element={<LiturgiaPage />} />
          <Route path="/wspolnoty" element={<WspolnotyPage />} />
          <Route path="/galeria" element={<GaleriaPage />} />
          <Route path="/kancelaria" element={<KancelariaPage />} />
          <Route path="/kontakt" element={<KontaktPage />} />
          <Route path="/modlitwa" element={<ModlitwaPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>

      <Footer />
      <LockButton />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <ThemeProvider>
        <AppLayout />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "General Sans, system-ui, sans-serif",
              fontWeight: 300,
            },
          }}
        />
      </ThemeProvider>
    </RouterProvider>
  );
}
