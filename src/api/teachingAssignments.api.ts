import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  TeachingAssignmentCreatePayload,
  TeachingAssignmentDto,
} from "@/types/teachingAssignment.types";

export async function getTeachingAssignmentsBySection(
  schoolId: number,
  sectionId: number,
): Promise<TeachingAssignmentDto[]> {
  const res = await apiClient.get<TeachingAssignmentDto[]>(
    API_ENDPOINTS.teachingAssignments.list,
    { params: { school_id: schoolId, section_id: sectionId } },
  );
  return res.data;
}

export async function listTeachingAssignments(
  schoolId: number,
  params?: {
    sectionId?: number;
    teacherId?: number;
  },
): Promise<TeachingAssignmentDto[]> {
  const query: any = { school_id: schoolId };
  if (params?.sectionId) query.section_id = params.sectionId;
  if (params?.teacherId) query.teacher_id = params.teacherId;

  const res = await apiClient.get<TeachingAssignmentDto[]>(
    API_ENDPOINTS.teachingAssignments.list,
    { params: query },
  );
  return res.data;
}
export async function createTeachingAssignment(
  payload: TeachingAssignmentCreatePayload & { school_id: number },
): Promise<TeachingAssignmentDto> {
  const res = await apiClient.post<TeachingAssignmentDto>(
    API_ENDPOINTS.teachingAssignments.create,
    payload,
  );
  return res.data;
}
