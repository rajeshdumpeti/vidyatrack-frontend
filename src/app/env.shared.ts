export type AppEnvironment = "dev" | "stage" | "prod";

export type FeatureFlags = {
  enablePlatformManagement: boolean;
  enableTeacherCommunications: boolean;
  enableStudentNotes: boolean;
};

type PublicEnv = Record<string, string | undefined>;

export type RuntimeConfig = {
  environment: AppEnvironment;
  hostname: string;
  appBaseUrl: string;
  apiBaseUrl: string;
  apiBaseUrls: Record<AppEnvironment, string>;
  appHosts: Record<AppEnvironment, string>;
  featureFlags: FeatureFlags;
  isDev: boolean;
  isStage: boolean;
  isProd: boolean;
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function requireEnv(env: PublicEnv, key: string): string {
  const value = env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env var: ${key}`);
  }

  return value.trim();
}

function parseEnvironment(value: string, key: string): AppEnvironment {
  const normalized = value.trim().toLowerCase();

  if (normalized === "dev" || normalized === "stage" || normalized === "prod") {
    return normalized;
  }

  throw new Error(
    `Invalid ${key}: "${value}" (expected dev|stage|prod)`,
  );
}

function parseBoolean(value: string, key: string): boolean {
  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(
    `Invalid ${key}: "${value}" (expected true|false)`,
  );
}

function normalizeHost(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

function normalizeBaseUrl(value: string, key: string): string {
  const trimmed = value.trim();

  try {
    const url = new URL(trimmed);
    return url.origin;
  } catch {
    throw new Error(`Invalid ${key}: "${value}" must be a full URL`);
  }
}

function getAppHosts(env: PublicEnv): Record<AppEnvironment, string> {
  return {
    dev: normalizeHost(requireEnv(env, "VITE_APP_HOST_DEV")),
    stage: normalizeHost(requireEnv(env, "VITE_APP_HOST_STAGE")),
    prod: normalizeHost(requireEnv(env, "VITE_APP_HOST_PROD")),
  };
}

function getApiBaseUrls(env: PublicEnv): Record<AppEnvironment, string> {
  return {
    dev: normalizeBaseUrl(requireEnv(env, "VITE_API_BASE_URL_DEV"), "VITE_API_BASE_URL_DEV"),
    stage: normalizeBaseUrl(
      requireEnv(env, "VITE_API_BASE_URL_STAGE"),
      "VITE_API_BASE_URL_STAGE",
    ),
    prod: normalizeBaseUrl(
      requireEnv(env, "VITE_API_BASE_URL_PROD"),
      "VITE_API_BASE_URL_PROD",
    ),
  };
}

function getFeatureFlags(
  env: PublicEnv,
): Record<AppEnvironment, FeatureFlags> {
  return {
    dev: {
      enablePlatformManagement: parseBoolean(
        requireEnv(env, "VITE_FEATURE_PLATFORM_MANAGEMENT_DEV"),
        "VITE_FEATURE_PLATFORM_MANAGEMENT_DEV",
      ),
      enableTeacherCommunications: parseBoolean(
        requireEnv(env, "VITE_FEATURE_TEACHER_COMMUNICATIONS_DEV"),
        "VITE_FEATURE_TEACHER_COMMUNICATIONS_DEV",
      ),
      enableStudentNotes: parseBoolean(
        requireEnv(env, "VITE_FEATURE_STUDENT_NOTES_DEV"),
        "VITE_FEATURE_STUDENT_NOTES_DEV",
      ),
    },
    stage: {
      enablePlatformManagement: parseBoolean(
        requireEnv(env, "VITE_FEATURE_PLATFORM_MANAGEMENT_STAGE"),
        "VITE_FEATURE_PLATFORM_MANAGEMENT_STAGE",
      ),
      enableTeacherCommunications: parseBoolean(
        requireEnv(env, "VITE_FEATURE_TEACHER_COMMUNICATIONS_STAGE"),
        "VITE_FEATURE_TEACHER_COMMUNICATIONS_STAGE",
      ),
      enableStudentNotes: parseBoolean(
        requireEnv(env, "VITE_FEATURE_STUDENT_NOTES_STAGE"),
        "VITE_FEATURE_STUDENT_NOTES_STAGE",
      ),
    },
    prod: {
      enablePlatformManagement: parseBoolean(
        requireEnv(env, "VITE_FEATURE_PLATFORM_MANAGEMENT_PROD"),
        "VITE_FEATURE_PLATFORM_MANAGEMENT_PROD",
      ),
      enableTeacherCommunications: parseBoolean(
        requireEnv(env, "VITE_FEATURE_TEACHER_COMMUNICATIONS_PROD"),
        "VITE_FEATURE_TEACHER_COMMUNICATIONS_PROD",
      ),
      enableStudentNotes: parseBoolean(
        requireEnv(env, "VITE_FEATURE_STUDENT_NOTES_PROD"),
        "VITE_FEATURE_STUDENT_NOTES_PROD",
      ),
    },
  };
}

export function validatePublicEnv(env: PublicEnv): void {
  getAppHosts(env);
  getApiBaseUrls(env);
  getFeatureFlags(env);
  parseEnvironment(requireEnv(env, "VITE_BUILD_ENVIRONMENT"), "VITE_BUILD_ENVIRONMENT");
  parseEnvironment(
    requireEnv(env, "VITE_FALLBACK_ENVIRONMENT"),
    "VITE_FALLBACK_ENVIRONMENT",
  );
}

export function resolveBuildEnvironment(env: PublicEnv): AppEnvironment {
  return parseEnvironment(
    requireEnv(env, "VITE_BUILD_ENVIRONMENT"),
    "VITE_BUILD_ENVIRONMENT",
  );
}

export function resolveRuntimeConfig(
  env: PublicEnv,
  hostname: string,
): RuntimeConfig {
  const appHosts = getAppHosts(env);
  const apiBaseUrls = getApiBaseUrls(env);
  const featureFlags = getFeatureFlags(env);
  const fallbackEnvironment = parseEnvironment(
    requireEnv(env, "VITE_FALLBACK_ENVIRONMENT"),
    "VITE_FALLBACK_ENVIRONMENT",
  );
  const normalizedHostname = normalizeHost(hostname);
  const isLocalHost = LOCAL_HOSTS.has(normalizedHostname);

  let environment: AppEnvironment = fallbackEnvironment;

  if (isLocalHost || normalizedHostname === appHosts.dev) {
    environment = "dev";
  } else if (normalizedHostname === appHosts.stage) {
    environment = "stage";
  } else if (normalizedHostname === appHosts.prod) {
    environment = "prod";
  }

  return {
    environment,
    hostname: normalizedHostname,
    appBaseUrl: `https://${appHosts[environment]}`,
    // Use Vite's local /api proxy during local development to avoid remote CORS issues.
    apiBaseUrl: isLocalHost ? "" : apiBaseUrls[environment],
    apiBaseUrls,
    appHosts,
    featureFlags: featureFlags[environment],
    isDev: environment === "dev",
    isStage: environment === "stage",
    isProd: environment === "prod",
  };
}
