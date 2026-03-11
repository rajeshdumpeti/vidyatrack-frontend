import type { TeacherDto } from "@/types/teacher.types";

export function getTeacherProfileViewModel(teacher: TeacherDto) {
  const name = teacher.name ?? "—";
  const phone = teacher.phone ?? "—";
  const email = teacher.email ?? "—";
  const publicId = teacher.public_id ?? teacher.employee_id ?? "—";
  const status = teacher.status
    ? teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)
    : typeof teacher.is_active === "boolean"
      ? teacher.is_active
        ? "Active"
        : "Inactive"
      : null;
  const assignmentLabels = (teacher.assignments ?? [])
    .map((item) => item.label?.trim())
    .filter((label): label is string => Boolean(label));
  const primarySection = teacher.assigned_section_label?.trim() || null;

  return {
    name,
    phone,
    email,
    publicId,
    status,
    assignmentLabels,
    primarySection,
  };
}
