export type TeacherDto = {
  id: number;
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
  name: string;
  phone?: string;
  email?: string | null;
};

export type CreateTeacherInput = {
  name: string;
  phone: string;
  section_id: number;
  email?: string;
};
