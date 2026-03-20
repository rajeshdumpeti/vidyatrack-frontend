import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePrincipalStudents } from "@/hooks/usePrincipalStudents";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/utils/logger";

import { MOCK_SECTIONS, MOCK_STUDENTS } from "../constants/studentsSetup.constants";
import { filterMockStudents } from "../helpers/studentsSetup.helpers";

export function useStudentsSetupPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [sectionId, setSectionId] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const sectionIdNumber = sectionId ? Number(sectionId) : undefined;
  const studentsQuery = usePrincipalStudents({ sectionId: sectionIdNumber, search });
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const navigateRole = role ?? "teacher";

  const filteredMock = useMemo(
    () =>
      filterMockStudents({
        students: MOCK_STUDENTS,
        search,
        sectionId: sectionIdNumber,
      }),
    [search, sectionIdNumber],
  );

  const onFilterChange = (next: Partial<{ sectionId: string; search: string }>) => {
    if (next.sectionId !== undefined) setSectionId(next.sectionId);
    if (next.search !== undefined) setSearch(next.search);

    logger.info("[principal][students] filters_changed", {
      trace,
      sectionId: next.sectionId ?? sectionId,
      search: next.search ?? search,
    });
  };

  return {
    trace,
    navigate,
    navigateRole,
    sectionId,
    search,
    filteredMock,
    studentsQuery,
    sections: MOCK_SECTIONS,
    onFilterChange,
    onStudentClick: (studentId: number, publicId?: string | number | null) => {
      logger.info("[principal][students] row_tap", {
        trace,
        studentId,
      });
      navigate(`/${navigateRole}/students/${publicId ?? studentId}`);
    },
  };
}
