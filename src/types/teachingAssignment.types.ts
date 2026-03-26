export type TeachingAssignmentDto = {
  id: number;
  school_id: number;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  substitute_teacher_id?: number | null;
  created_at?: string;
};

export type TeachingAssignmentMeDto = TeachingAssignmentDto & {
  section_name?: string | null;
  class_name?: string | null;
  subject_name?: string | null;
  teacher_name?: string | null;
};

export type TeachingAssignmentCreatePayload = {
  section_id: number;
  subject_id: number;
  teacher_id: number;
};

export type TeacherAssignmentHistoryDto = {
  id: number;
  school_id: number;
  section_id: number;
  subject_id: number;
  previous_teacher_id: number | null;
  new_teacher_id: number;
  changed_by_user_id: number | null;
  action: "ASSIGNED" | "REASSIGNED";
  changed_at: string;
};
