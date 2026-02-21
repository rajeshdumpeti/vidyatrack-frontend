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

  // 2. Attach active school_id for protected app APIs, but not for CMS endpoints
  const requestUrl = config.url ?? "";
  const isCmsRequest = requestUrl.includes("/cms/");

  if (schoolId && !isCmsRequest) {
    config.params = {
      ...config.params,
      school_id: schoolId,
    };
  }

  return config;
});
