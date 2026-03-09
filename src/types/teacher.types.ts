export type TeacherDto = {
  id: number;
  public_id?: string;
  school_id: number;

  name?: string | null;
  phone?: string | null;
  email?: string | null;
  employee_id?: string | null;
  status?: string | null;
  assignments?: Array<{
    id?: number | null;
    label: string;
  }> | null;
  is_active?: boolean | null;
  role?: string | null;
  // Optional label returned by backend only (no joins client-side)
  assigned_section_label?: string | null;
};

export type TeacherMeDto = TeacherDto & {
  user_id?: number | null;
};

export type Teacher = {
  id: number;
  public_id?: string;
  name: string;
  phone?: string;
  email?: string | null;
};

export type TeacherContextDto = {
  teacher_id: number;
  user_id: number;
  school_id: number;
  school_name: string;
  class_id: number | null;
  class_name: string | null;
  section_id: number | null;
  section_name: string | null;
  subjects: Array<{
    subject_id: number;
    subject_name: string;
  }>;
};

export type TeacherReadinessDto = {
  status: string;
  school_id?: number | null;
  teacher_id?: number | null;
  section_id?: number | null;
  checks: {
    has_teacher_profile: boolean;
    has_school_mapping: boolean;
    has_primary_section: boolean;
    has_subject_assignments: boolean;
    has_students_in_primary_section: boolean;
  };
  missing_requirements: string[];
  recommended_next_action?: string | null;
};

export interface CreateTeacherInput {
  name: string;
  phone: string;
  email?: string;
  section_id?: number;
  school_id?: number; // Add this to allow the mutation to pass it
}
