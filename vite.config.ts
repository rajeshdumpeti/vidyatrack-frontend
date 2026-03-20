import path from "path";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

import {
  resolveBuildEnvironment,
  validatePublicEnv,
} from "./src/app/env.shared";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Fail the build immediately when required Vite variables are missing or invalid.
  validatePublicEnv(env);
  const buildEnvironment = resolveBuildEnvironment(env);

  return {
    plugins: [react(), tailwindcss()],
    build: {
      target: "es2022",
      cssCodeSplit: true,
      modulePreload: {
        polyfill: false,
      },
      minify: buildEnvironment === "dev" ? false : "esbuild",
      sourcemap: buildEnvironment !== "prod",
      reportCompressedSize: buildEnvironment !== "dev",
      chunkSizeWarningLimit: buildEnvironment === "prod" ? 650 : 900,
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
              id.includes("react-router") ||
              id.includes("@remix-run") ||
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
          target: env.VITE_LOCAL_API_PROXY_TARGET || "http://127.0.0.1:8000",
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
  };
});
