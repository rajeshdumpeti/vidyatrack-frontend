import type { PrincipalMarksRowDto } from "@/types/principalMarks.types";

export type MarksHistoryFilterState = {
  sectionId: number | "";
  subjectId: number | "";
  examType: string;
  search: string;
};

export type MarksHistoryTotals = {
  total: number;
  avgScore: number;
  avgPct: number;
  passCount: number;
  passPct: number;
  belowThreshold: number;
  topScore: number;
};

export type MarksHistoryClassBreakdownRow = {
  label: string;
  total: number;
  obtained: number;
  max: number;
  pass: number;
  avgPct: number;
  fail: number;
};

export type MarksHistoryPagination = {
  pagedItems: PrincipalMarksRowDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  from: number;
  to: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};
