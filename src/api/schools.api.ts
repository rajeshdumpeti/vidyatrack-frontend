import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  SchoolDashboardDto,
  SchoolDto,
  SchoolStaffListItemDto,
  SchoolStudentListItemDto,
  SchoolTeacherListItemDto,
} from "@/types/school.types";

export async function getSchools(): Promise<SchoolDto[]> {
  const res = await apiClient.get<SchoolDto[]>(API_ENDPOINTS.schools.list);
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
): Promise<SchoolTeacherListItemDto[]> {
  const res = await apiClient.get<SchoolTeacherListItemDto[]>(
    API_ENDPOINTS.schools.teachers(schoolId),
  );
  return res.data;
}

export async function getSchoolStudents(
  schoolId: number,
): Promise<SchoolStudentListItemDto[]> {
  const res = await apiClient.get<SchoolStudentListItemDto[]>(
    API_ENDPOINTS.schools.students(schoolId),
  );
  return res.data;
}

export async function getSchoolStaff(
  schoolId: number,
): Promise<SchoolStaffListItemDto[]> {
  const res = await apiClient.get<SchoolStaffListItemDto[]>(
    API_ENDPOINTS.schools.staff(schoolId),
  );
  return res.data;
}
