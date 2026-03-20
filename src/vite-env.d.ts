/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUILD_ENVIRONMENT: "dev" | "stage" | "prod";
  readonly VITE_FALLBACK_ENVIRONMENT: "dev" | "stage" | "prod";
  readonly VITE_APP_HOST_DEV: string;
  readonly VITE_APP_HOST_STAGE: string;
  readonly VITE_APP_HOST_PROD: string;
  readonly VITE_API_BASE_URL_DEV: string;
  readonly VITE_API_BASE_URL_STAGE: string;
  readonly VITE_API_BASE_URL_PROD: string;
  readonly VITE_LOCAL_API_PROXY_TARGET?: string;
  readonly VITE_FEATURE_PLATFORM_MANAGEMENT_DEV: string;
  readonly VITE_FEATURE_PLATFORM_MANAGEMENT_STAGE: string;
  readonly VITE_FEATURE_PLATFORM_MANAGEMENT_PROD: string;
  readonly VITE_FEATURE_TEACHER_COMMUNICATIONS_DEV: string;
  readonly VITE_FEATURE_TEACHER_COMMUNICATIONS_STAGE: string;
  readonly VITE_FEATURE_TEACHER_COMMUNICATIONS_PROD: string;
  readonly VITE_FEATURE_STUDENT_NOTES_DEV: string;
  readonly VITE_FEATURE_STUDENT_NOTES_STAGE: string;
  readonly VITE_FEATURE_STUDENT_NOTES_PROD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
