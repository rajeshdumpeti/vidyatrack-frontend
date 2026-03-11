import type { AssignSubjectsTeacherDto } from "../types/assignSubjects.types";

export function getFriendlyAssignError(err: unknown): string {
  const maybeError = err as {
    response?: { status?: number; data?: { detail?: unknown } };
  };
  const status = maybeError?.response?.status;
  const detail = maybeError?.response?.data?.detail;
  if (status === 409 && detail === "assignment_conflict") {
    return "Subject already assigned to another teacher.";
  }
  return "Unable to assign right now. Retry once.";
}

export function getTeacherLabel(teacher: AssignSubjectsTeacherDto) {
  return teacher.name?.trim() || teacher.phone?.trim() || `ID: ${teacher.id}`;
}
