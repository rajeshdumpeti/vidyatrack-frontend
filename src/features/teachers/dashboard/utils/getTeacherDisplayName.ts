import type { TeacherMeDto } from "@/types/teacher.types";

export function getTeacherDisplayName(teacher: TeacherMeDto | undefined) {
  return teacher?.name?.trim() || teacher?.phone || "Teacher";
}
