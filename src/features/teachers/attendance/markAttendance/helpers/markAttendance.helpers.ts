import type { AttendanceStatusDto } from "@/types/attendance-submit.types";

export function normalizeAttendanceStatus(
  status: AttendanceStatusDto,
): "PRESENT" | "ABSENT" {
  return status === "ABSENT" || status === "absent" ? "ABSENT" : "PRESENT";
}
