import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { CreateTeacherInput, Teacher } from "@/types/teacher.types";
import { logger } from "@/utils/logger";

export async function createManagementTeacher(
  payload: CreateTeacherInput
): Promise<Teacher> {
  if (import.meta.env.DEV) {
    logger.info("[mgmt][teachers][api] request", {
      endpoint: API_ENDPOINTS.management.teachersCreate,
      payload,
    });
  }
  try {
    const res = await apiClient.post<Teacher>(
      API_ENDPOINTS.management.teachersCreate,
      payload
    );
    if (import.meta.env.DEV) {
      logger.info("[mgmt][teachers][api] response", {
        status: res.status,
        data: res.data,
      });
    }
    return res.data;
  } catch (err: any) {
    if (import.meta.env.DEV) {
      logger.warn("[mgmt][teachers][api] error", {
        status: err?.response?.status,
        data: err?.response?.data,
      });
    }
    throw err;
  }
}
