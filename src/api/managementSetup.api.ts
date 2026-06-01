import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import { schoolParams } from "./helpers/schoolParams";
import type {
  ManagementClassSubject,
  ManagementClassSubjectsResponse,
  ManagementSchoolProfile,
  ManagementSection,
  ManagementSectionGroup,
  ManagementSetupCompleteResponse,
  ManagementSetupStatus,
} from "@/types/managementSetup.types";

export async function getManagementSetupStatus(
  schoolId: number,
): Promise<ManagementSetupStatus> {
  const res = await apiClient.get<ManagementSetupStatus>(
    API_ENDPOINTS.management.setupStatus,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function getManagementSchoolProfile(
  schoolId: number,
): Promise<ManagementSchoolProfile> {
  const res = await apiClient.get<ManagementSchoolProfile>(
    "/api/v1/management/school-profile",
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function updateManagementSchoolProfile(
  schoolId: number,
  payload: Omit<ManagementSchoolProfile, "school_id" | "school_name" | "school_code" | "modules_enabled">,
): Promise<ManagementSchoolProfile> {
  const res = await apiClient.patch<ManagementSchoolProfile>(
    "/api/v1/management/school-profile",
    payload,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function completeManagementSetup(
  schoolId: number,
): Promise<ManagementSetupCompleteResponse> {
  const res = await apiClient.post<ManagementSetupCompleteResponse>(
    API_ENDPOINTS.management.setupComplete,
    {},
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function listManagementSections(
  schoolId: number,
): Promise<ManagementSectionGroup[]> {
  const res = await apiClient.get<ManagementSectionGroup[]>(
    API_ENDPOINTS.management.sections,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function createManagementSection(
  schoolId: number,
  payload: {
    class_id: number;
    name: string;
    capacity: number;
    room_number?: string | null;
  },
): Promise<ManagementSection> {
  const res = await apiClient.post<ManagementSection>(
    API_ENDPOINTS.management.sections,
    payload,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function deleteManagementSection(
  schoolId: number,
  sectionId: number,
): Promise<{ success: boolean }> {
  const res = await apiClient.delete<{ success: boolean }>(
    `${API_ENDPOINTS.management.sections}/${sectionId}`,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function listManagementSubjects(
  schoolId: number,
  classId: number,
): Promise<ManagementClassSubjectsResponse> {
  const res = await apiClient.get<ManagementClassSubjectsResponse>(
    API_ENDPOINTS.management.subjects,
    { params: { ...schoolParams(schoolId), class_id: classId } },
  );
  return res.data;
}

export async function createManagementSubject(
  schoolId: number,
  payload: {
    class_id: number;
    subject_id?: number;
    name?: string;
    subject_type: "core" | "elective" | "language" | "activity";
    max_marks: number;
    passing_marks: number;
  },
): Promise<ManagementClassSubject> {
  const res = await apiClient.post<ManagementClassSubject>(
    API_ENDPOINTS.management.subjects,
    payload,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}

export async function deleteManagementSubject(
  schoolId: number,
  classSubjectId: number,
): Promise<{ success: boolean }> {
  const res = await apiClient.delete<{ success: boolean }>(
    `${API_ENDPOINTS.management.subjects}/${classSubjectId}`,
    { params: schoolParams(schoolId) },
  );
  return res.data;
}
