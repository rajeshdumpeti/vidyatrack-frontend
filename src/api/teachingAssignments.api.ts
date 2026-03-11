import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import { schoolParams } from "./helpers/schoolParams";
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
    { params: { ...schoolParams(schoolId), section_id: sectionId } },
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
  const query: Record<string, number> = { ...schoolParams(schoolId) };
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
