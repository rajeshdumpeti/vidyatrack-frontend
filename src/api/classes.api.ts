import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { ClassDto } from "@/types/class.types";

/**
 * Fetches classes filtered by the active school.
 * The schoolId is passed as a query parameter (?school_id=X)
 */
export async function getClasses(schoolId: number): Promise<ClassDto[]> {
  const res = await apiClient.get<ClassDto[]>(API_ENDPOINTS.classes.list, {
    params: { school_id: schoolId }, // Forces the backend to filter by this school
  });
  return res.data;
}

/**
 * Creates a new class for a specific school.
 */
export async function createClass(payload: {
  name: string;
  school_id: number; // Added to ensure the link is correct
}): Promise<ClassDto> {
  const { school_id, ...data } = payload;
  const res = await apiClient.post<ClassDto>(
    API_ENDPOINTS.classes.create,
    data,
    {
      params: { school_id }, // Backend reads context from query params
    },
  );
  return res.data;
}
