import type { ParentStudent, TeacherCommunicationsNavigationState } from "../types/teacherCommunications.types";
import type { TeachingAssignmentMeDto } from "@/types/teachingAssignment.types";

export function toAssignmentKey(assignment: TeachingAssignmentMeDto) {
  return `${assignment.section_id}-${assignment.subject_id}`;
}

export function findInitialAssignment(
  assignments: TeachingAssignmentMeDto[],
  navigationState: TeacherCommunicationsNavigationState | null,
) {
  const stateSectionId = Number(navigationState?.section_id);
  const stateSubjectId = Number(navigationState?.subject_id);
  const stateSubjectName = String(navigationState?.subject_name ?? "").trim();

  const fromState = assignments.find((assignment) => {
    const sameSection = assignment.section_id === stateSectionId;
    const sameSubjectId =
      Number.isFinite(stateSubjectId) && assignment.subject_id === stateSubjectId;
    const sameSubjectName =
      stateSubjectName.length > 0 &&
      String(assignment.subject_name ?? "").trim() === stateSubjectName;

    return sameSection && (sameSubjectId || sameSubjectName);
  });

  return fromState ?? assignments[0];
}

export function matchesParentSearch(student: ParentStudent, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const name = String(student.name ?? "").toLowerCase();
  const roll =
    student.roll_no != null ? String(student.roll_no).toLowerCase() : "";
  const phone = String(student.parent_phone ?? "").toLowerCase();
  const parentName = String(student.parent_name ?? "").toLowerCase();

  return (
    name.includes(normalizedQuery) ||
    roll.includes(normalizedQuery) ||
    phone.includes(normalizedQuery) ||
    parentName.includes(normalizedQuery)
  );
}

export function matchesNoteStudentSearch(student: ParentStudent, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const name = String(student.name ?? "").toLowerCase();
  const roll =
    student.roll_no != null ? String(student.roll_no).toLowerCase() : "";

  return name.includes(normalizedQuery) || roll.includes(normalizedQuery);
}
