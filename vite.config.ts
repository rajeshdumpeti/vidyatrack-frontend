import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("@tanstack/react-query") ||
            id.includes("zustand")
          ) {
            return "state";
          }

          if (
            id.includes("react-dom") ||
            id.includes("/react/") ||
            id.includes("\\react\\")
          ) {
            return "react-vendor";
          }

          if (
            id.includes("axios") ||
            id.includes("react-hook-form") ||
            id.includes("lucide-react") ||
            id.includes("react-icons")
          ) {
            return "ui-vendor";
          }

          if (id.includes("@bharathis-canvas/ui-platform")) {
            return "canvas-ui";
          }

          return "vendor";
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
