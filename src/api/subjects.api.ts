import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { Subject, SubjectCreateInput } from "@/types/subject.types";

export async function listSubjects(schoolId: number): Promise<Subject[]> {
  const res = await apiClient.get<Subject[]>(API_ENDPOINTS.subjects.list, {
    params: { school_id: schoolId },
  });
  return res.data;
}

export async function createSubject(
  payload: SubjectCreateInput & { school_id: number },
): Promise<Subject> {
  const res = await apiClient.post<Subject>(
    API_ENDPOINTS.subjects.create,
    payload,
    { params: { school_id: payload.school_id } },
  );
  return res.data;
}
