import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { SectionDto } from "@/types/section.types";

/**
 * Fetches sections, scoped by school via query params.
 */
export async function getSections(schoolId: number): Promise<SectionDto[]> {
  const res = await apiClient.get<SectionDto[]>(API_ENDPOINTS.sections.list, {
    params: { school_id: schoolId },
  });
  return res.data;
}

/**
 * Creates a section.
 * We send the name/class_id in the body, and school_id in the query params.
 */
export async function createSection(payload: {
  class_id: number;
  name: string;
  school_id: number; // Added context
}): Promise<SectionDto> {
  const { school_id, ...body } = payload;
  const res = await apiClient.post<SectionDto>(
    API_ENDPOINTS.sections.create,
    body,
    {
      params: { school_id }, // Critical for backend validation
    },
  );
  return res.data;
}
