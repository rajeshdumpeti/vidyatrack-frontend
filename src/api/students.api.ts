import type { PaginatedDto } from "@/types/school.types";
import type {
  StudentImportCommitInput,
  StudentImportCommitResponse,
  StudentImportPreviewResponse,
  StudentCreateInput,
  StudentDto,
  StudentListItem,
  StudentProfileDto,
  StudentReportCardDto,
  StudentUpdateInput,
} from "@/types/student.types";
import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import { schoolParams } from "./helpers/schoolParams";

/**
 * Fetch students for a specific section within a school (full list for attendance/marks).
 */
export async function getStudentsBySection(
  sectionId: number,
  schoolId: number,
): Promise<StudentListItem[]> {
  const res = await apiClient.get<PaginatedDto<StudentListItem>>(
    API_ENDPOINTS.students.list,
    {
      params: {
        section_id: sectionId,
        limit: 500,
        ...schoolParams(schoolId),
      },
    },
  );
  return res.data.data;
}

/**
 * Paginated students list for the current school.
 */
export async function getStudents(
  schoolId: number,
  params?: { page?: number; limit?: number; search?: string; sectionId?: number | null },
): Promise<PaginatedDto<StudentDto>> {
  const res = await apiClient.get<PaginatedDto<StudentDto>>(API_ENDPOINTS.students.list, {
    params: {
      ...schoolParams(schoolId),
      page: params?.page ?? 1,
      limit: params?.limit ?? 25,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.sectionId ? { section_id: params.sectionId } : {}),
    },
  });
  return res.data;
}

/**
 * Scoped list with full Dto details (full list for attendance/marks).
 */
export async function getStudentsBySectionId(
  sectionId: number,
  schoolId: number,
): Promise<StudentDto[]> {
  const res = await apiClient.get<PaginatedDto<StudentDto>>(API_ENDPOINTS.students.list, {
    params: {
      section_id: sectionId,
      limit: 500,
      ...schoolParams(schoolId),
    },
  });
  return res.data.data;
}

/**
 * Create a student within a specific school context.
 */
export async function createStudent(
  payload: StudentCreateInput,
  schoolId: number, // Added schoolId
): Promise<StudentDto> {
  const res = await apiClient.post<StudentDto>(
    API_ENDPOINTS.students.create,
    payload,
    {
      params: schoolParams(schoolId),
    },
  );
  return res.data;
}

export async function updateStudent(
  studentId: string,
  payload: StudentUpdateInput,
  schoolId: number,
): Promise<StudentDto> {
  const res = await apiClient.patch<StudentDto>(
    API_ENDPOINTS.students.detail(studentId),
    payload,
    {
      params: schoolParams(schoolId),
    },
  );
  return res.data;
}

/**
 * Fetch a single student profile.
 */
export async function getStudentProfile(
  studentId: string,
  schoolId: number, // Added schoolId
): Promise<StudentProfileDto> {
  const res = await apiClient.get<StudentProfileDto>(
    API_ENDPOINTS.students.detail(studentId),
    {
      params: schoolParams(schoolId),
    },
  );
  return res.data;
}

export async function getStudentReportCard(
  studentId: string,
  schoolId: number,
): Promise<StudentReportCardDto> {
  const res = await apiClient.get<StudentReportCardDto>(
    API_ENDPOINTS.students.reportCard(studentId),
    {
      params: schoolParams(schoolId),
    },
  );
  return res.data;
}

export async function previewStudentsImport(
  file: File,
  schoolId: number,
): Promise<StudentImportPreviewResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<StudentImportPreviewResponse>(
    API_ENDPOINTS.students.importPreview,
    formData,
    {
      params: schoolParams(schoolId),
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data;
}

export async function commitStudentsImport(
  payload: StudentImportCommitInput,
  schoolId: number,
): Promise<StudentImportCommitResponse> {
  const res = await apiClient.post<StudentImportCommitResponse>(
    API_ENDPOINTS.students.importCommit,
    payload,
    {
      params: schoolParams(schoolId),
    },
  );
  return res.data;
}
