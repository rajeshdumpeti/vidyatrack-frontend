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

export async function listTeachingAssignments(params?: {
  sectionId?: number;
  teacherId?: number;
}): Promise<TeachingAssignmentDto[]> {
  const query =
    params && (params.sectionId || params.teacherId)
      ? {
          section_id: params.sectionId,
          teacher_id: params.teacherId,
        }
      : undefined;
  const res = await apiClient.get<TeachingAssignmentDto[]>(
    API_ENDPOINTS.teachingAssignments.list,
    { params: query }
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
