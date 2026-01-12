import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { SchoolDto } from "../types/school.types";

export async function getSchools(): Promise<SchoolDto[]> {
  const res = await apiClient.get<SchoolDto[]>(API_ENDPOINTS.schools.list);
  return res.data;
}

export async function createSchool(payload: {
  name: string;
}): Promise<SchoolDto> {
  const res = await apiClient.post<SchoolDto>(
    API_ENDPOINTS.schools.create,
    payload
  );
  return res.data;
}
