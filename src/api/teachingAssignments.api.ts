import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import { schoolParams } from "./helpers/schoolParams";
import type {
  TeacherAssignmentHistoryDto,
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

export async function setSubstituteTeacher(
  assignmentId: number,
  substituteTeacherId: number | null,
  schoolId: number,
): Promise<TeachingAssignmentDto> {
  const res = await apiClient.patch<TeachingAssignmentDto>(
    API_ENDPOINTS.teachingAssignments.substitute(assignmentId),
    { substitute_teacher_id: substituteTeacherId },
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function getTeacherAssignmentHistory(
  schoolId: number,
  sectionId: number,
  subjectId: number,
): Promise<TeacherAssignmentHistoryDto[]> {
  const res = await apiClient.get<TeacherAssignmentHistoryDto[]>(
    API_ENDPOINTS.teachingAssignments.history,
    { params: { school_id: schoolId, section_id: sectionId, subject_id: subjectId } },
  );
  return res.data;
}
