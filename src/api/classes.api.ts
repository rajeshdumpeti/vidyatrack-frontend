import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { ClassDto } from "../types/class.types";

export async function getClasses(): Promise<ClassDto[]> {
  const res = await apiClient.get<ClassDto[]>(API_ENDPOINTS.classes.list);
  return res.data;
}

export async function createClass(payload: {
  name: string;
}): Promise<ClassDto> {
  const res = await apiClient.post<ClassDto>(
    API_ENDPOINTS.classes.create,
    payload
  );
  return res.data;
}
