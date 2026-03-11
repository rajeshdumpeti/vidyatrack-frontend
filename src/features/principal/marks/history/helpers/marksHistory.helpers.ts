import type { PrincipalMarksRowDto } from "@/types/principalMarks.types";

import type {
  MarksHistoryClassBreakdownRow,
  MarksHistoryTotals,
} from "../types/marksHistory.types";

export function pct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

export function getMarksHistoryTotals(
  rows: PrincipalMarksRowDto[],
): MarksHistoryTotals {
  const total = rows.length;
  const totalObtained = rows.reduce((sum, row) => sum + row.marks_obtained, 0);
  const totalMax = rows.reduce((sum, row) => sum + row.max_marks, 0);
  const avgScore = total ? totalObtained / total : 0;
  const avgPct = totalMax ? (totalObtained / totalMax) * 100 : 0;
  const passCount = rows.filter(
    (row) => (row.marks_obtained / row.max_marks) * 100 >= 35,
  ).length;
  const belowThreshold = total - passCount;
  const topScore = rows.reduce(
    (max, row) => Math.max(max, row.marks_obtained),
    0,
  );

  return {
    total,
    avgScore: Math.round(avgScore * 10) / 10,
    avgPct: pct(avgPct),
    passCount,
    passPct: total ? pct((passCount / total) * 100) : 0,
    belowThreshold,
    topScore,
  };
}

export function getClassBreakdown(
  rows: PrincipalMarksRowDto[],
  sectionLabelById: Map<number, string>,
): MarksHistoryClassBreakdownRow[] {
  const map = new Map<
    string,
    {
      label: string;
      total: number;
      obtained: number;
      max: number;
      pass: number;
    }
  >();

  rows.forEach((row) => {
    const key = `${row.class_name ?? ""}|${row.section_name ?? ""}|${row.section_id ?? 0}`;
    const fallbackSection =
      row.section_id != null ? sectionLabelById.get(row.section_id) : undefined;
    const label =
      (row.class_name && row.section_name
        ? `${row.class_name} - ${row.section_name}`
        : fallbackSection) ?? "Unknown Section";
    const entry = map.get(key) ?? {
      label,
      total: 0,
      obtained: 0,
      max: 0,
      pass: 0,
    };
    entry.total += 1;
    entry.obtained += row.marks_obtained;
    entry.max += row.max_marks;
    if ((row.marks_obtained / row.max_marks) * 100 >= 35) entry.pass += 1;
    map.set(key, entry);
  });

  return Array.from(map.values()).map((entry) => {
    const avgPct = entry.max ? pct((entry.obtained / entry.max) * 100) : 0;
    return {
      ...entry,
      avgPct,
      fail: entry.total - entry.pass,
    };
  });
}

export function filterMarksRows(
  rows: PrincipalMarksRowDto[],
  search: string,
): PrincipalMarksRowDto[] {
  const term = search.trim().toLowerCase();
  if (!term) return rows;

  return rows.filter((row) => {
    const name = String(row.student_name ?? "").toLowerCase();
    const roll = String(row.roll_no ?? "").toLowerCase();
    return name.includes(term) || roll.includes(term);
  });
}

export function getStudentClassLabel(
  row: PrincipalMarksRowDto,
  sectionLabelById: Map<number, string>,
) {
  return row.class_name && row.section_name
    ? `${row.class_name} - ${row.section_name}`
    : ((row.section_id ? sectionLabelById.get(row.section_id) : undefined) ??
        "—");
}
