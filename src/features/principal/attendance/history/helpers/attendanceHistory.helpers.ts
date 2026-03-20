import type { PrincipalAttendanceRowDto } from "@/types/principalAttendance.types";

import type {
  AttendanceHistoryBreakdownRow,
  AttendanceHistoryTotals,
} from "../types/attendanceHistory.types";

export function getAttendanceHistoryTotals(
  rows: PrincipalAttendanceRowDto[],
): AttendanceHistoryTotals {
  const total = rows.length;
  const present = rows.filter((row) =>
    String(row.status).toUpperCase().includes("PRESENT"),
  ).length;
  const absent = total - present;
  const presentPct = total ? Math.round((present / total) * 100) : 0;
  const absentPct = total ? Math.round((absent / total) * 100) : 0;
  return { total, present, absent, presentPct, absentPct };
}

export function getAttendanceBreakdown(
  rows: PrincipalAttendanceRowDto[],
  sectionLabelById: Map<number, string>,
): AttendanceHistoryBreakdownRow[] {
  const map = new Map<number, { total: number; present: number }>();
  const labels = new Map<number, string>();

  rows.forEach((row) => {
    const key = row.section_id ?? 0;
    const entry = map.get(key) ?? { total: 0, present: 0 };
    entry.total += 1;
    if (String(row.status).toUpperCase().includes("PRESENT")) {
      entry.present += 1;
    }
    map.set(key, entry);

    const backendLabel =
      row.class_name && row.section_name
        ? `${row.class_name} - ${row.section_name}`
        : (row.class_name ?? row.section_name);
    if (backendLabel) {
      labels.set(key, backendLabel);
    }
  });

  return Array.from(map.entries()).map(([key, entry]) => {
    const label = labels.get(key) ?? sectionLabelById.get(key) ?? `Section #${key}`;
    const absent = entry.total - entry.present;
    const pct = entry.total ? Math.round((entry.present / entry.total) * 100) : 0;
    return {
      key,
      label,
      total: entry.total,
      present: entry.present,
      absent,
      pct,
    };
  });
}
