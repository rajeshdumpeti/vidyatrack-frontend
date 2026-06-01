export type ManagementSetupStep = {
  key: string;
  label: string;
  completed: boolean;
  count?: number | null;
  required_min: number;
};

export type ManagementSetupStatus = {
  school_id: number;
  management_setup_complete: boolean;
  management_setup_completed_at?: string | null;
  completion_pct: number;
  completed_steps: number;
  total_steps: number;
  steps: ManagementSetupStep[];
};

export type ManagementSetupCompleteResponse = {
  success: boolean;
  management_setup_complete: boolean;
  completed_at: string;
};

export type ManagementSchoolProfile = {
  school_id: number;
  school_name: string;
  school_code?: string | null;
  board?: string | null;
  category?: string | null;
  medium?: string | null;
  school_type?: string | null;
  established_year?: number | null;
  current_session?: string | null;
  working_days_per_week?: number | null;
  academic_start_month?: number | null;
  academic_end_month?: number | null;
  class_levels: string[];
  street?: string | null;
  area?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pin_code?: string | null;
  country?: string | null;
  landmark?: string | null;
  school_phone?: string | null;
  school_email?: string | null;
  website?: string | null;
  modules_enabled: string[];
};

export type ManagementSection = {
  id: number;
  public_id: string;
  school_id: number;
  class_id: number;
  class_name: string;
  name: string;
  capacity: number;
  room_number?: string | null;
  is_active: boolean;
};

export type ManagementSectionGroup = {
  class_id: number;
  class_name: string;
  sections: ManagementSection[];
};

export type ManagementClassSubject = {
  id: number;
  public_id: string;
  class_id: number;
  class_name: string;
  subject_id: number;
  subject_name: string;
  subject_type: "core" | "elective" | "language" | "activity" | string;
  max_marks: number;
  passing_marks: number;
  is_active: boolean;
};

export type ManagementClassSubjectsResponse = {
  class_id: number;
  class_name: string;
  subjects: ManagementClassSubject[];
  subject_catalog: Array<{ id: number; name: string }>;
};
