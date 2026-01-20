export type TeachingAssignmentDto = {
  id: number;
  school_id: number;
  section_id: number;
  subject_id: number;
  teacher_id: number;
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
