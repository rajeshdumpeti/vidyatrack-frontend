import type { AttendanceSection } from "@/types/attendance.types";
import type { TeacherReadinessDto } from "@/types/teacher.types";
import type { TeachingAssignmentMeDto } from "@/types/teachingAssignment.types";

export type TeacherDashboardAction = {
  id: "attendance" | "marks" | "notes";
  label: string;
  route: string;
};

export type TeacherDashboardState = {
  teacherName: string;
  toast: string | null;
  activeAssignment: TeachingAssignmentMeDto | null;
  assignments: TeachingAssignmentMeDto[];
  assignmentsLoading: boolean;
  readiness: {
    data: TeacherReadinessDto | undefined;
    isLoading: boolean;
    error: unknown;
    refetch: () => unknown;
  };
  attendanceSection: {
    data: AttendanceSection | undefined;
    isLoading: boolean;
    error: unknown;
    refetch: () => unknown;
  };
  dismissToast: () => void;
  selectAssignment: (assignment: TeachingAssignmentMeDto) => void;
  handleAction: (route: string) => void;
  refetchAll: () => void;
};

export type TeacherSetupStatus = TeacherReadinessDto["status"];
