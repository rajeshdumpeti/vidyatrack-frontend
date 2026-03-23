import axios from "axios";
import { ENV } from "@/app/env";
import { useAuthStore } from "@/store/auth.store";
import { useHardStopStore } from "@/store/hardStop.store";
import { useFlashStore } from "@/store/flash.store";

export const apiClient = axios.create({
  baseURL: ENV.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken, schoolId } = useAuthStore.getState();

  // 1. Attach Bearer Token
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // 2. Attach active school_id only for app-scoped APIs (never auth/cms).
  const requestUrl = config.url ?? "";
  const isAuthRequest = requestUrl.includes("/api/v1/auth/");
  const isCmsRequest = requestUrl.includes("/cms/");

  if (schoolId && !isCmsRequest && !isAuthRequest) {
    config.params = {
      ...config.params,
      school_id: schoolId,
    };
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { setReason } = useHardStopStore.getState();
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setReason("offline");
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;

    if (status === 401) {
      const { clearAuth } = useAuthStore.getState();
      const { setFlash } = useFlashStore.getState();
      clearAuth();
      setFlash("Session expired. Please log in again.", "error");
      window.location.href = "/auth/login";
    } else if (status === 402) {
      setReason("subscription_expired");
    } else if (status === 403 && detail === "inactive_user") {
      setReason("inactive_user");
    } else if (status === 503 && detail === "maintenance") {
      setReason("maintenance");
    } else if (status && status >= 500) {
      setReason("service_down");
    }

    return Promise.reject(error);
  },
);
