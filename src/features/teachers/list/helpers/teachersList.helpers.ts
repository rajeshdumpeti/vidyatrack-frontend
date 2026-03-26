import type { TeacherDto } from "@/types/teacher.types";

export function getAllAssignmentLabels(teachers: TeacherDto[]) {
  const labels = new Set<string>();
  teachers.forEach((teacher) => {
    (teacher.assignments ?? []).forEach((assignment) => {
      if (assignment.label) labels.add(assignment.label);
    });
  });
  return Array.from(labels).sort((a, b) => a.localeCompare(b));
}

export function filterTeachers(args: {
  teachers: TeacherDto[];
  search: string;
  statusFilter: string;
  subjectFilter: string;
}) {
  const queryText = args.search.trim().toLowerCase();
  const tokens = queryText ? queryText.split(/\s+/g).filter(Boolean) : [];

  const matchesSearch = (teacher: TeacherDto) => {
    if (!tokens.length) return true;
    const haystack = [
      teacher.name,
      teacher.phone,
      teacher.email,
      teacher.assigned_section_label,
      teacher.public_id,
      teacher.employee_id,
      teacher.status,
      ...(teacher.assignments ?? []).map((assignment) => assignment.label),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  };

  return args.teachers.filter((teacher) => {
    if (!matchesSearch(teacher)) return false;
    if (args.statusFilter !== "ALL") {
      const status = (teacher.status ?? "ACTIVE").toUpperCase();
      if (status !== args.statusFilter.toUpperCase()) return false;
    }
    if (args.subjectFilter !== "ALL") {
      const labels = (teacher.assignments ?? []).map(
        (assignment) => assignment.label,
      );
      if (!labels.includes(args.subjectFilter)) return false;
    }
    return true;
  });
}

export function normalizeAssignmentLabel(value: string) {
  return value.toLowerCase().replace(/[\s•.-]+/g, "");
}
