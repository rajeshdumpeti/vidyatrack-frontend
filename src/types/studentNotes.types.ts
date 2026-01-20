export type StudentNoteDto = {
  id: number;
  school_id: number;
  student_id: number;
  author_user_id: number | null;
  author_name?: string | null;
  author_role?: string | null;
  note_text: string;
  created_at: string; // ISO string
};

export type CreateStudentNotePayload = {
  note_text: string;
};
