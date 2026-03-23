export type PaginatedDto<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type SchoolDto = {
  id: number;
  public_id?: string;
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
  school_code?: string | null;
  admin_phone: string;
  admin_email?: string | null;
};

export type SchoolDashboardDto = {
  school_id: number;
  school_public_id?: string | null;
  teacher_count: number;
  student_count: number;
  staff_count: number;
  total_registered: number;
};

export type SchoolTeacherListItemDto = {
  id: number;
  school_id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: "active" | "inactive";
};

export type SchoolStudentListItemDto = {
  id: number;
  school_id: number;
  name: string;
  parent_name?: string | null;
  parent_phone?: string | null;
  status: "active" | "inactive";
};

export type SchoolStaffListItemDto = {
  user_id: number;
  school_id: number;
  role: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: "active" | "inactive";
};
