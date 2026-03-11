import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePagination } from "@/hooks/usePagination";
import { usePrincipalMarksHistory } from "@/hooks/usePrincipalMarksHistory";
import { useSections } from "@/hooks/useSections";
import { useSubjects } from "@/hooks/useSubjects";
import { useAuthStore } from "@/store/auth.store";
import type { PrincipalMarksRowDto } from "@/types/principalMarks.types";
import type { SectionDto } from "@/types/section.types";
import { logger } from "@/utils/logger";

import {
  filterMarksRows,
  getClassBreakdown,
  getMarksHistoryTotals,
} from "../helpers/marksHistory.helpers";
import { exportMarksHistoryCsv } from "../utils/marksHistory.utils";

export function useMarksHistoryPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const navigateRole = role ?? "principal";
  const sections = useSections().list;
  const subjects = useSubjects();
  const [sectionId, setSectionId] = useState<number | "">("");
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [examType, setExamType] = useState<string>("UNIT_TEST");
  const [search, setSearch] = useState("");

  const sectionLabelById = useMemo(() => {
    const map = new Map<number, string>();
    (sections.data ?? []).forEach((section: SectionDto) => {
      const classLabel = section.class_name ?? `Class #${section.class_id}`;
      map.set(section.id, `${classLabel} - ${section.name}`);
    });
    return map;
  }, [sections.data]);

  const selectedSubjectId =
    subjectId === "" ? Number(subjects.data?.[0]?.id ?? 0) : Number(subjectId);

  const query = usePrincipalMarksHistory({
    sectionId: sectionId === "" ? undefined : Number(sectionId),
    subjectId: selectedSubjectId > 0 ? selectedSubjectId : undefined,
    examType,
  });

  const rows = useMemo(
    () => (query.data ?? []) as PrincipalMarksRowDto[],
    [query.data],
  );
  const filteredRows = useMemo(() => filterMarksRows(rows, search), [rows, search]);
  const rosterPagination = usePagination(filteredRows, {
    initialPageSize: 20,
    resetDeps: [sectionId, subjectId, examType, search],
  });
  const totals = useMemo(() => getMarksHistoryTotals(rows), [rows]);
  const classBreakdown = useMemo(
    () => getClassBreakdown(rows, sectionLabelById),
    [rows, sectionLabelById],
  );

  const exportCsv = () => {
    exportMarksHistoryCsv({ rows: filteredRows, examType });
  };

  const onFilterChange = (
    next: Partial<{
      sectionId: number | "";
      subjectId: number | "";
      examType: string;
    }>,
  ) => {
    if (next.sectionId !== undefined) setSectionId(next.sectionId);
    if (next.subjectId !== undefined) setSubjectId(next.subjectId);
    if (next.examType !== undefined) setExamType(next.examType);
    logger.info("[principal][marks-overview] filters_changed", {
      trace,
      sectionId: next.sectionId ?? sectionId,
      subjectId: next.subjectId ?? subjectId,
      examType: next.examType ?? examType,
    });
  };

  const openStudent = (row: PrincipalMarksRowDto) => {
    navigate(`/${navigateRole}/students/${row.student_id}`, {
      state: {
        breadcrumbLabel: row.student_name ?? "Student Profile",
      },
    });
  };

  const loading = query.isLoading || sections.isLoading || subjects.isLoading;
  const hasData = !loading && !query.error && rows.length > 0;

  return {
    sectionId,
    subjectId,
    selectedSubjectId,
    examType,
    search,
    setSearch,
    sections,
    subjects,
    query,
    rows,
    filteredRows,
    rosterPagination,
    totals,
    classBreakdown,
    sectionLabelById,
    onFilterChange,
    exportCsv,
    openStudent,
    loading,
    hasData,
  };
}
