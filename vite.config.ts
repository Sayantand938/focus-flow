// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: "0.0.0.0", // 👈 listen on all interfaces (LAN + localhost)
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
