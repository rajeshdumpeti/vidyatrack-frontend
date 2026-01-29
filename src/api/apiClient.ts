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

  // 2. Automatically attach active school_id to all requests
  // This ensures backend security checks pass without manual work in components
  if (schoolId) {
    config.params = {
      ...config.params,
      school_id: schoolId,
    };
  }

  return config;
});
