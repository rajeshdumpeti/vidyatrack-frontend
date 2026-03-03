import type {
  StudentImportCommitInput,
  StudentImportCommitResponse,
  StudentImportPreviewResponse,
  StudentCreateInput,
  StudentDto,
  StudentListItem,
  StudentProfileDto,
  StudentReportCardDto,
} from "@/types/student.types";
import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

/**
 * Fetch students for a specific section within a school.
 */
export async function getStudentsBySection(
  sectionId: number,
  schoolId: number, // Added schoolId
): Promise<StudentListItem[]> {
  const res = await apiClient.get<StudentListItem[]>(
    API_ENDPOINTS.students.list,
    {
      params: {
        section_id: sectionId,
        school_id: schoolId, // Pass to backend
      },
    },
  );
  return res.data;
}

/**
 * Baseline students list for the current school.
 */
export async function getStudents(schoolId: number): Promise<StudentDto[]> {
  const res = await apiClient.get<StudentDto[]>(API_ENDPOINTS.students.list, {
    params: { school_id: schoolId }, // Ensure all sections are scoped to school
  });
  return res.data;
}

/**
 * Scoped list with full Dto details.
 */
export async function getStudentsBySectionId(
  sectionId: number,
  schoolId: number, // Added schoolId
): Promise<StudentDto[]> {
  const res = await apiClient.get<StudentDto[]>(API_ENDPOINTS.students.list, {
    params: {
      section_id: sectionId,
      school_id: schoolId,
    },
  });
  return res.data;
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
      params: { school_id: schoolId }, // Post requests also need school_id query param
    },
  );
  return res.data;
}

/**
 * Fetch a single student profile.
 */
export async function getStudentProfile(
  studentId: number,
  schoolId: number, // Added schoolId
): Promise<StudentProfileDto> {
  const res = await apiClient.get<StudentProfileDto>(
    API_ENDPOINTS.students.detail(studentId),
    {
      params: { school_id: schoolId },
    },
  );
  return res.data;
}

export async function getStudentReportCard(
  studentId: number,
  schoolId: number,
): Promise<StudentReportCardDto> {
  const res = await apiClient.get<StudentReportCardDto>(
    API_ENDPOINTS.students.reportCard(studentId),
    {
      params: { school_id: schoolId },
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
      params: { school_id: schoolId },
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
      params: { school_id: schoolId },
    },
  );
  return res.data;
}
