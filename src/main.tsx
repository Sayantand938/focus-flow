// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@/shared/context/ThemeProvider";
import { Toaster } from "@/shared/components/ui/sonner"; // <-- UPDATED IMPORT
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="focus-flow-theme">
      <App />
      {/* --- REPLACED with the new Sonner Toaster --- */}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  </React.StrictMode>
);