import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { CreateTeacherInput, Teacher } from "../types/teacher.types";

export async function createManagementTeacher(
  payload: CreateTeacherInput
): Promise<Teacher> {
  const res = await apiClient.post<Teacher>(
    API_ENDPOINTS.management.teachersCreate,
    payload
  );
  return res.data;
}
