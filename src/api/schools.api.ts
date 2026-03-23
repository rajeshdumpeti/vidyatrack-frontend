import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  PaginatedDto,
  SchoolDashboardDto,
  SchoolDto,
  SchoolStaffListItemDto,
  SchoolStudentListItemDto,
  SchoolTeacherListItemDto,
} from "@/types/school.types";

export async function getSchools(
  search?: string,
  page = 1,
  limit = 25,
): Promise<PaginatedDto<SchoolDto>> {
  const res = await apiClient.get<PaginatedDto<SchoolDto>>(API_ENDPOINTS.schools.list, {
    params: { ...(search ? { search } : {}), page, limit },
  });
  return res.data;
}

export async function createSchool(payload: {
  name: string;
  admin_phone: string;
  admin_email?: string | null;
  idempotencyKey?: string;
}): Promise<SchoolDto> {
  const { idempotencyKey, ...body } = payload;
  const res = await apiClient.post<SchoolDto>(
    API_ENDPOINTS.schools.create,
    body,
    idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : undefined,
  );
  return res.data;
}

export async function getSchoolDashboard(
  schoolId: number,
): Promise<SchoolDashboardDto> {
  const res = await apiClient.get<SchoolDashboardDto>(
    API_ENDPOINTS.schools.dashboard(schoolId),
  );
  return res.data;
}

export async function getSchoolTeachers(
  schoolId: number,
  page = 1,
  limit = 25,
): Promise<PaginatedDto<SchoolTeacherListItemDto>> {
  const res = await apiClient.get<PaginatedDto<SchoolTeacherListItemDto>>(
    API_ENDPOINTS.schools.teachers(schoolId),
    { params: { page, limit } },
  );
  return res.data;
}

export async function getSchoolStudents(
  schoolId: number,
  page = 1,
  limit = 25,
): Promise<PaginatedDto<SchoolStudentListItemDto>> {
  const res = await apiClient.get<PaginatedDto<SchoolStudentListItemDto>>(
    API_ENDPOINTS.schools.students(schoolId),
    { params: { page, limit } },
  );
  return res.data;
}

export async function getSchoolStaff(
  schoolId: number,
  page = 1,
  limit = 25,
): Promise<PaginatedDto<SchoolStaffListItemDto>> {
  const res = await apiClient.get<PaginatedDto<SchoolStaffListItemDto>>(
    API_ENDPOINTS.schools.staff(schoolId),
    { params: { page, limit } },
  );
  return res.data;
}
