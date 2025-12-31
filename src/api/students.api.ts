import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";

export type StudentListItem = {
  id: number;
  name: string;
  // Optional if backend later returns roll_no/admission_no etc.
  roll_no?: string | number | null;
};

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
