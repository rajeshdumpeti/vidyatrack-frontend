type EnvironmentName = "dev" | "test" | "stage" | "pilot" | "prod";

function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required env var: ${String(key)}`);
  }
  return value.trim();
}

function normalizeEnvName(value: string): EnvironmentName {
  const v = value.toLowerCase().trim();
  if (
    v === "dev" ||
    v === "test" ||
    v === "stage" ||
    v === "pilot" ||
    v === "prod"
  )
    return v;
  throw new Error(
    `Invalid VITE_ENVIRONMENT: "${value}" (expected dev|test|stage|pilot|prod)`
  );
}

export const ENV = Object.freeze({
  apiBaseUrl: requireEnv("VITE_API_BASE_URL"),
  environment: normalizeEnvName(requireEnv("VITE_ENVIRONMENT")),
});
