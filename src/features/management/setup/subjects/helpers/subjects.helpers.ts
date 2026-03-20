import type { SectionDto } from "@/types/section.types";
import type { TeachingAssignmentDto } from "@/types/teachingAssignment.types";

export function normalizeSubjectSearch(value: string) {
  return value.trim().toLowerCase();
}

export function getSubjectUsage(args: {
  assignments: TeachingAssignmentDto[];
  sectionsById: Map<number, SectionDto>;
}) {
  const map = new Map<
    number,
    { teacherCount: number; classCount: number; sectionCount: number }
  >();

  args.assignments.forEach((assignment) => {
    const current = map.get(assignment.subject_id) ?? {
      teacherCount: 0,
      classCount: 0,
      sectionCount: 0,
    };
    const teacherSet = new Set<number>();
    const classSet = new Set<number>();
    const sectionSet = new Set<number>();

    args.assignments
      .filter((row) => row.subject_id === assignment.subject_id)
      .forEach((row) => {
        teacherSet.add(row.teacher_id);
        sectionSet.add(row.section_id);
        const section = args.sectionsById.get(row.section_id);
        if (section?.class_id) classSet.add(section.class_id);
      });

    current.teacherCount = teacherSet.size;
    current.classCount = classSet.size;
    current.sectionCount = sectionSet.size;
    map.set(assignment.subject_id, current);
  });

  return map;
}
