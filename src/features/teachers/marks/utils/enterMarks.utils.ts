import type { StudentListItem } from "@/types/student.types";
import type { TeachingAssignmentMeDto } from "@/types/teachingAssignment.types";

const CUSTOM_EXAM_STORAGE_PREFIX = "vt_marks_custom_exams_";

export function buildBlankMarks(students: StudentListItem[]) {
  return Object.fromEntries(students.map((student) => [String(student.id), ""])) as Record<
    string,
    string
  >;
}

export function filterStudentsByQuery(
  students: StudentListItem[],
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return students;

  return students.filter((student, index) => {
    const name = String(student.name ?? "").toLowerCase();
    const roll =
      student.roll_no != null
        ? String(student.roll_no).toLowerCase()
        : String(index + 1);

    return name.includes(normalizedQuery) || roll.includes(normalizedQuery);
  });
}

export function getAssignmentToken(assignment: TeachingAssignmentMeDto | undefined) {
  return assignment ? `${assignment.section_id}-${assignment.subject_id}` : "na";
}

export function getCustomChipStorageKey(assignmentToken: string) {
  return `${CUSTOM_EXAM_STORAGE_PREFIX}${assignmentToken}`;
}
