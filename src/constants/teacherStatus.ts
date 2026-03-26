import type { TeacherStatus } from "@/types/teacher.types";

export const TEACHER_STATUS_CONFIG: Record<
  TeacherStatus,
  { label: string; badgeClass: string; actionClass: string }
> = {
  ACTIVE: {
    label: "Active",
    badgeClass: "bg-green-50 text-green-700 border-green-200",
    actionClass: "text-emerald-700 hover:bg-emerald-50",
  },
  ON_LEAVE: {
    label: "On Leave",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    actionClass: "text-amber-700 hover:bg-amber-50",
  },
  RESIGNED: {
    label: "Resigned",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    actionClass: "text-red-700 hover:bg-red-50",
  },
  TRANSFERRED: {
    label: "Transferred",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    actionClass: "text-slate-600 hover:bg-slate-100",
  },
};

/**
 * Which statuses can be transitioned to from a given status.
 * Only statuses listed here appear as options in the action menu / status list.
 */
export const TEACHER_NEXT_STATUSES: Record<TeacherStatus, TeacherStatus[]> = {
  ACTIVE: ["ON_LEAVE", "RESIGNED", "TRANSFERRED"],
  ON_LEAVE: ["ACTIVE", "RESIGNED", "TRANSFERRED"],
  RESIGNED: ["ACTIVE"],
  TRANSFERRED: ["ACTIVE"],
};
