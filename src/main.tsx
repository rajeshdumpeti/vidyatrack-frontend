import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppProviders } from "./app/providers";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_BUILD_ENVIRONMENT ?? "dev",
    tracesSampleRate: import.meta.env.VITE_BUILD_ENVIRONMENT === "prod" ? 0.2 : 1.0,
  });
}

if (import.meta.env.DEV) {
  import("./api/auth.api");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
);
