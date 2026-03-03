import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
