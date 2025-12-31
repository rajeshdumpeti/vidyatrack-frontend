import type { StudentListItem } from "../types/student.types";
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
