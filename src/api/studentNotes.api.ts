import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "./endpoints";
import type {
  CreateStudentNotePayload,
  StudentNoteDto,
} from "../types/studentNotes.types";

export async function getStudentNotes(
  studentId: number
): Promise<StudentNoteDto[]> {
  const res = await apiClient.get<StudentNoteDto[]>(
    API_ENDPOINTS.studentNotes.list(studentId)
  );
  return res.data;
}

export async function createStudentNote(
  studentId: number,
  payload: CreateStudentNotePayload
): Promise<StudentNoteDto> {
  const res = await apiClient.post<StudentNoteDto>(
    API_ENDPOINTS.studentNotes.create(studentId),
    payload
  );
  return res.data;
}
