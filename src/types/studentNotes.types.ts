export type StudentNoteDto = {
  id: number;
  school_id: number;
  student_id: number;
  student_name?: string | null;
  section_id?: number | null;
  subject_id?: number | null;
  author_user_id: number | null;
  author_name?: string | null;
  author_role?: string | null;
  class_name?: string | null;
  section_name?: string | null;
  subject_name?: string | null;
  note_text: string;
  created_at: string; // ISO string
};

export type CreateStudentNotePayload = {
  note_text: string;
  section_id?: number | null;
  subject_id?: number | null;
};
