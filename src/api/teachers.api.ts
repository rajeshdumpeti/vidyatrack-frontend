import type { AttendanceSection } from "@/types/attendance.types";
import type {
  CreateTeacherInput,
  TeacherDto,
  Teacher,
  TeacherMeDto,
} from "@/types/teacher.types";
import type { TeachingAssignmentMeDto } from "@/types/teachingAssignment.types";
import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export async function getMyAttendanceSection(): Promise<AttendanceSection> {
  const res = await apiClient.get<AttendanceSection>(
    API_ENDPOINTS.teachers.meAttendanceSection
  );
  return res.data;
}

export async function getTeachers(): Promise<TeacherDto[]> {
  const res = await apiClient.get<TeacherDto[]>(API_ENDPOINTS.teachers.list);
  return res.data;
}

export async function listTeachers(): Promise<Teacher[]> {
  const res = await apiClient.get<Teacher[]>(API_ENDPOINTS.teachers.list);
  return res.data;
}

export async function createTeacher(
  payload: CreateTeacherInput
): Promise<TeacherDto> {
  const res = await apiClient.post<TeacherDto>(
    API_ENDPOINTS.teachers.create,
    payload
  );
  return res.data;
}

export async function getTeacherMe(): Promise<TeacherMeDto> {
  const res = await apiClient.get<TeacherMeDto>(API_ENDPOINTS.teachers.me);
  return res.data;
}

export async function getMyTeachingAssignments(): Promise<
  TeachingAssignmentMeDto[]
> {
  const res = await apiClient.get<TeachingAssignmentMeDto[]>(
    API_ENDPOINTS.teachers.meTeachingAssignments
  );
  return res.data;
}
