export type TeacherDto = {
  id: number;
  school_id: number;

  name?: string | null;
  phone?: string | null;
  email?: string | null;

  // Optional label returned by backend only (no joins client-side)
  assigned_section_label?: string | null;
};
