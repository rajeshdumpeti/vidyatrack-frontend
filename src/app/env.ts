import { resolveRuntimeConfig } from "@/app/env.shared";

const runtimeHostname =
  typeof window === "undefined" ? "localhost" : window.location.hostname;

export const ENV = Object.freeze(
  resolveRuntimeConfig(import.meta.env, runtimeHostname),
);

export const FEATURE_FLAGS = ENV.featureFlags;
