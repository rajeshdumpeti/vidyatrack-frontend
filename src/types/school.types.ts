export type SchoolDto = {
  id: number;
  name: string;
  code?: string | null;
  board?: string | null;
  category?: string | null;
  medium?: string | null;
  school_type?: string | null;
  established_year?: number | null;
  affiliation_number?: string | null;
  udise_code?: string | null;
  status?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  teacher_count?: number; // Added for Super Admin Pulse
  student_count?: number; // Added for Super Admin Pulse
  created_at?: string;
  updated_at?: string;
};

export type CreateSchoolPayload = {
  name: string;
  admin_phone: string;
};
