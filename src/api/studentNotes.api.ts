import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  CreateStudentNotePayload,
  StudentNoteDto,
} from "@/types/studentNotes.types";

export async function getStudentNotes(
  studentId: number,
  schoolId: number,
): Promise<StudentNoteDto[]> {
  const res = await apiClient.get<StudentNoteDto[]>(
    API_ENDPOINTS.students.notes(studentId),
    { params: { school_id: schoolId } },
  );
  return res.data;
}

export async function createStudentNote(
  studentId: number,
  payload: CreateStudentNotePayload,
  schoolId: number,
): Promise<StudentNoteDto> {
  const res = await apiClient.post<StudentNoteDto>(
    API_ENDPOINTS.students.notes(studentId),
    payload,
    { params: { school_id: schoolId } },
  );
  return res.data;
}
