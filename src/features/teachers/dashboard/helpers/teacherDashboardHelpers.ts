import type { TeacherSetupStatus } from "../types/teacherDashboard.types";

const SETUP_STATUS_MESSAGES: Record<string, string> = {
  needs_school_mapping: "Your school access mapping is pending.",
  needs_primary_section: "Primary section is not assigned yet.",
  needs_subject_assignment: "No subject assignment found for your profile.",
  needs_students: "No students are enrolled in your primary section.",
  needs_teacher_profile: "Teacher profile has not been created.",
};

export function getTeacherSetupMessage(status: TeacherSetupStatus) {
  return (
    SETUP_STATUS_MESSAGES[status] ?? "Your teacher account setup is incomplete."
  );
}

export function isActiveAssignment(
  currentAssignmentKey: string | null,
  sectionId: number,
  subjectName: string | null | undefined,
) {
  return currentAssignmentKey === `${sectionId}-${subjectName ?? ""}`;
}
