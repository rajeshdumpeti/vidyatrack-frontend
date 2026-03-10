import { useMemo, useState } from "react";

import { usePrincipalAttendanceHistory } from "@/hooks/usePrincipalAttendanceHistory";
import { useSections } from "@/hooks/useSections";
import { useAuthStore } from "@/store/auth.store";
import type { PrincipalAttendanceRowDto } from "@/types/principalAttendance.types";
import type { SectionDto } from "@/types/section.types";
import { formatIsoDate } from "@/utils/date";
import { logger } from "@/utils/logger";

import {
  getAttendanceBreakdown,
  getAttendanceHistoryTotals,
} from "../helpers/attendanceHistory.helpers";

export function useAttendanceHistoryPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const schoolId = useAuthStore((state) => state.schoolId);
  const [sectionId, setSectionId] = useState<number | "">("");
  const todayIso = formatIsoDate(new Date());
  const [dateIso, setDateIso] = useState<string>(todayIso);
  const query = usePrincipalAttendanceHistory(
    dateIso,
    sectionId === "" ? undefined : sectionId,
    schoolId,
  );
  const sections = useSections().list;

  const sectionLabelById = useMemo(() => {
    const map = new Map<number, string>();
    (sections.data ?? []).forEach((section: SectionDto) => {
      const classLabel = section.class_name ?? `Class #${section.class_id}`;
      map.set(section.id, `${classLabel} - ${section.name}`);
    });
    return map;
  }, [sections.data]);

  const onFilterChange = (
    next: Partial<{ sectionId: number | ""; dateIso: string }>,
  ) => {
    if (next.sectionId !== undefined) setSectionId(next.sectionId);
    if (next.dateIso !== undefined) {
      const safeDate = next.dateIso > todayIso ? todayIso : next.dateIso;
      setDateIso(safeDate);
    }

    logger.info("[principal][attendance-history] filters_changed", {
      trace,
      sectionId: next.sectionId ?? sectionId,
      dateIso: next.dateIso ?? dateIso,
    });
  };

  const rows = useMemo(
    () => (query.data ?? []) as PrincipalAttendanceRowDto[],
    [query.data],
  );
  const totals = useMemo(() => getAttendanceHistoryTotals(rows), [rows]);
  const breakdown = useMemo(
    () => getAttendanceBreakdown(rows, sectionLabelById),
    [rows, sectionLabelById],
  );

  return {
    sectionId,
    dateIso,
    todayIso,
    query,
    sections,
    rows,
    totals,
    breakdown,
    sectionLabelById,
    onFilterChange,
  };
}
