export type TeacherDto = {
  id: number;
  school_id: number;

  name?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean | null;
  role?: string | null;
  // Optional label returned by backend only (no joins client-side)
  assigned_section_label?: string | null;
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
  email?: string;
};
