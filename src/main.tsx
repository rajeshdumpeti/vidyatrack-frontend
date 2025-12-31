import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppProviders } from "./app/providers";
import { AppErrorBoundary } from "./components/feedback/AppErrorBoundary";

if (import.meta.env.DEV) {
  import("./api/auth.api");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppProviders />
    </AppErrorBoundary>
  </StrictMode>
);
