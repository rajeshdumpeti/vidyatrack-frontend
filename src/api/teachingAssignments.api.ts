import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  TeachingAssignmentCreatePayload,
  TeachingAssignmentDto,
} from "@/types/teachingAssignment.types";

export async function getTeachingAssignmentsBySection(
  sectionId: number
): Promise<TeachingAssignmentDto[]> {
  const res = await apiClient.get<TeachingAssignmentDto[]>(
    API_ENDPOINTS.teachingAssignments.list,
    { params: { section_id: sectionId } }
  );
  return res.data;
}

export async function createTeachingAssignment(
  payload: TeachingAssignmentCreatePayload
): Promise<TeachingAssignmentDto> {
  const res = await apiClient.post<TeachingAssignmentDto>(
    API_ENDPOINTS.teachingAssignments.create,
    payload
  );
  return res.data;
}
