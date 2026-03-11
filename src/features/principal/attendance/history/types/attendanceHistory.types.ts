export type AttendanceHistoryBreakdownRow = {
  key: number;
  label: string;
  total: number;
  present: number;
  absent: number;
  pct: number;
};

export type AttendanceHistoryTotals = {
  total: number;
  present: number;
  absent: number;
  presentPct: number;
  absentPct: number;
};
