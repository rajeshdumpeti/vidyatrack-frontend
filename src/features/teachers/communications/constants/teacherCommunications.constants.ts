import type { TabKey } from "../types/teacherCommunications.types";

export const TEACHER_COMMUNICATION_TABS: Array<{
  key: TabKey;
  label: string;
}> = [
  { key: "homework", label: "Homework" },
  { key: "parents", label: "Parent Messages" },
  { key: "notes", label: "Student Notes" },
];
