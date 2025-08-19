// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@/shared/context/ThemeProvider";
import { Toaster, ToastPosition } from "react-hot-toast";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import "./index.css";

/**
 * A responsive Toaster component that adjusts its position and style
 * based on whether the user is on a mobile or desktop screen.
 */
const ResponsiveToaster = () => {
  const isMobile = useIsMobile();

  // Determine the best position based on the device:
  // - Top-right for desktop (conventional and visible)
  // - Bottom-center for mobile (standard "snackbar" position)
  const position: ToastPosition = isMobile ? "bottom-center" : "top-right";

  return (
    <Toaster
      position={position}
      toastOptions={{
        // Apply different styles for mobile vs. desktop
        style: {
          background: "var(--color-card)",
          color: "var(--color-card-foreground)",
          border: "1px solid var(--color-border)",
          // --- Responsive Style Adjustments ---
          textAlign: 'center',
          fontSize: isMobile ? '14px' : '16px',
          padding: isMobile ? '12px' : '16px',
          maxWidth: isMobile ? '90vw' : '350px', // Use viewport width on mobile for better fit
        },
        // Optional: Give mobile toasts a slightly shorter duration
        duration: isMobile ? 3000 : 4000,
      }}
    />
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="focus-flow-theme">
      <App />
      {/* Use the new responsive toaster component */}
      <ResponsiveToaster />
    </ThemeProvider>
  </React.StrictMode>
);