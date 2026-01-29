export type SchoolDto = {
  id: number;
  name: string;
  teacher_count?: number; // Added for Super Admin Pulse
  student_count?: number; // Added for Super Admin Pulse
  // Optional, if backend returns it later
  created_at?: string;
};

export type CreateSchoolPayload = {
  name: string;
  admin_phone: string;
};
