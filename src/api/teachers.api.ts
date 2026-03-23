import type { PaginatedDto } from "@/types/school.types";
import type { AttendanceSection } from "@/types/attendance.types";
import type {
  CreateTeacherInput,
  TeacherDto,
  TeacherMeDto,
  TeacherContextDto,
  TeacherReadinessDto,
} from "@/types/teacher.types";
import type { TeachingAssignmentMeDto } from "@/types/teachingAssignment.types";
import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import { schoolParams } from "./helpers/schoolParams";

export async function getMyAttendanceSection(): Promise<AttendanceSection> {
  const res = await apiClient.get<AttendanceSection>(
    API_ENDPOINTS.teachers.meAttendanceSection,
  );
  return res.data;
}

export async function getTeachers(): Promise<TeacherDto[]> {
  const res = await apiClient.get<TeacherDto[]>(API_ENDPOINTS.teachers.list);
  return res.data;
}

export async function listTeachers(
  schoolId: number,
  params?: { page?: number; limit?: number; search?: string },
): Promise<PaginatedDto<TeacherDto>> {
  const res = await apiClient.get<PaginatedDto<TeacherDto>>(API_ENDPOINTS.teachers.list, {
    params: {
      ...schoolParams(schoolId),
      page: params?.page ?? 1,
      limit: params?.limit ?? 25,
      ...(params?.search ? { search: params.search } : {}),
    },
  });
  return res.data;
}

// Update the creation payload
export async function createTeacher(
  payload: CreateTeacherInput & { school_id: number },
): Promise<TeacherDto> {
  const res = await apiClient.post<TeacherDto>(
    API_ENDPOINTS.teachers.create,
    payload,
  );
  return res.data;
}
export async function getTeacherMe(): Promise<TeacherMeDto> {
  const res = await apiClient.get<TeacherMeDto>(API_ENDPOINTS.teachers.me);
  return res.data;
}

export async function getTeacherReadiness(): Promise<TeacherReadinessDto> {
  const res = await apiClient.get<TeacherReadinessDto>(
    API_ENDPOINTS.teachers.meReadiness,
  );
  return res.data;
}

export async function getTeacherContext(
  schoolId: number,
): Promise<TeacherContextDto> {
  const res = await apiClient.get<TeacherContextDto>(
    API_ENDPOINTS.teachers.meContext,
    {
      params: schoolParams(schoolId),
    },
  );
  return res.data;
}

export async function getMyTeachingAssignments(): Promise<
  TeachingAssignmentMeDto[]
> {
  const res = await apiClient.get<TeachingAssignmentMeDto[]>(
    API_ENDPOINTS.teachers.meTeachingAssignments,
  );
  return res.data;
}
