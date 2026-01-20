import type {
  StudentCreateInput,
  StudentDto,
  StudentListItem,
  StudentProfileDto,
} from "@/types/student.types";
import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export async function getStudentsBySection(
  sectionId: number
): Promise<StudentListItem[]> {
  const res = await apiClient.get<StudentListItem[]>(
    API_ENDPOINTS.students.list,
    {
      params: { section_id: sectionId },
    }
  );
  return res.data;
}

/**
 * Baseline students list (no filters).
 * Use when "All Sections" is selected.
 */
export async function getStudents(): Promise<StudentDto[]> {
  const res = await apiClient.get<StudentDto[]>(API_ENDPOINTS.students.list);
  return res.data;
}

/**
 * Section-scoped list (server-side filtering).
 * Use when a specific section is selected.
 *
 * Note: Keep the return type aligned with your usage:
 * - If backend returns full StudentDto, return StudentDto[].
 * - If backend returns slim list, return StudentListItem[].
 *
 * For Principal Students page, we need parent_phone, so we use StudentDto[].
 */
export async function getStudentsBySectionId(
  sectionId: number
): Promise<StudentDto[]> {
  const res = await apiClient.get<StudentDto[]>(API_ENDPOINTS.students.list, {
    params: { section_id: sectionId },
  });
  return res.data;
}

export async function createStudent(
  payload: StudentCreateInput
): Promise<StudentDto> {
  const res = await apiClient.post<StudentDto>(
    API_ENDPOINTS.students.create,
    payload
  );
  return res.data;
}

export async function getStudentProfile(
  studentId: number
): Promise<StudentProfileDto> {
  const res = await apiClient.get<StudentProfileDto>(
    API_ENDPOINTS.students.detail(studentId)
  );
  return res.data;
}
