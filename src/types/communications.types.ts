export type HomeworkCreateRequest = {
  section_id: number;
  subject_id?: number | null;
  title: string;
  description: string;
  due_date?: string | null; // YYYY-MM-DD
};

export type ParentMessageRequest = {
  section_id: number;
  student_ids: number[];
  message: string;
  subject?: string | null;
};

export type HomeworkRecordDto = {
  id: number;
  school_id: number;
  section_id: number;
  subject_id?: number | null;
  title: string;
  description: string;
  due_date?: string | null;
  created_at?: string | null;
  created_by?: number | null;
};

export type ParentMessageRecordDto = {
  id: number;
  school_id: number;
  section_id: number;
  subject?: string | null;
  message: string;
  student_ids?: number[] | null;
  created_at?: string | null;
  created_by?: number | null;
};
