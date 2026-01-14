import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type { Subject, SubjectCreateInput } from "../types/subject.types";

export async function listSubjects(): Promise<Subject[]> {
  const res = await apiClient.get<Subject[]>(API_ENDPOINTS.subjects.list);
  return res.data;
}

export async function createSubject(
  payload: SubjectCreateInput
): Promise<Subject> {
  const res = await apiClient.post<Subject>(
    API_ENDPOINTS.subjects.create,
    payload
  );
  return res.data;
}
