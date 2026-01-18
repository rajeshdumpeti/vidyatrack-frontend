export type StudentListItem = {
  id: number;
  name: string;
  roll_no?: string | number | null;
};

export type StudentDto = {
  id: number;
  school_id: number;
  section_id: number;
  name: string;
  parent_phone: string;

  // Optional fields (do NOT assume they exist everywhere)
  roll_no?: string | number;
  class_name?: string | null;
  section_name?: string | null;
  class_id?: number | null;
};

export type StudentCreateInput = {
  name: string; // backend uses "name" (not full_name) in your DB/API
  section_id: number;
  parent_phone: string;
};
