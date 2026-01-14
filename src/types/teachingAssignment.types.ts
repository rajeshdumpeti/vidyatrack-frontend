export type TeachingAssignmentDto = {
  id: number;
  school_id: number;
  section_id: number;
  subject_id: number;
  teacher_id: number;
  created_at?: string;
};

export type TeachingAssignmentCreatePayload = {
  section_id: number;
  subject_id: number;
  teacher_id: number;
};
