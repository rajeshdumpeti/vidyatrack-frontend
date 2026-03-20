import type { StudentDto } from "@/types/student.types";

export const MOCK_SECTIONS = [
  { id: "", label: "All Sections" },
  { id: "1", label: "Class 5 - Section A" },
  { id: "2", label: "Class 5 - Section B" },
  { id: "3", label: "Class 6 - Section A" },
] as const;

export const MOCK_STUDENTS: StudentDto[] = [
  {
    id: 101,
    name: "Aarav Kumar",
    section_id: 1,
    parent_phone: "9876543210",
    school_id: 1,
  },
  {
    id: 102,
    name: "Meera Shah",
    section_id: 2,
    parent_phone: "9876543211",
    school_id: 1,
  },
];
