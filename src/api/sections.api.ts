import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { SectionDto } from "@/types/section.types";

export async function getSections(): Promise<SectionDto[]> {
  const res = await apiClient.get<SectionDto[]>(API_ENDPOINTS.sections.list);
  return res.data;
}

export async function createSection(payload: {
  class_id: number;
  name: string;
}): Promise<SectionDto> {
  const res = await apiClient.post<SectionDto>(
    API_ENDPOINTS.sections.create,
    payload
  );
  return res.data;
}
