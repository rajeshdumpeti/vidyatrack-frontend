import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePrincipalStudents } from "@/hooks/usePrincipalStudents";
import { useSections } from "@/hooks/useSections";
import { useStudentsBySection } from "@/hooks/useStudentsBySection";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { usePagination } from "@/hooks/usePagination";
import { useAuthStore } from "@/store/auth.store";
import type { SectionDto } from "@/types/section.types";
import type { StudentDto, StudentListItem } from "@/types/student.types";
import { logger } from "@/utils/logger";

export function useStudentsListPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [sectionId, setSectionId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [principalPage, setPrincipalPage] = useState(1);
  const sectionIdNumber = sectionId ? Number(sectionId) : undefined;
  const role = useAuthStore((state) => state.role);
  const isTeacher = role === "teacher";
  const sectionsList = useSections().list;
  const teacherSection = useTeacherAttendanceSection();
  const teacherSectionId = teacherSection.data?.section_id;
  const teacherStudents = useStudentsBySection(teacherSectionId);
  const principalQuery = usePrincipalStudents({
    sectionId: sectionIdNumber,
    search,
    page: principalPage,
    limit: 20,
  });
  const navigate = useNavigate();
  const navigateRole = role ?? "teacher";

  const onFilterChange = (
    next: Partial<{ sectionId: string; search: string }>,
  ) => {
    if (next.sectionId !== undefined) { setSectionId(next.sectionId); setPrincipalPage(1); }
    if (next.search !== undefined) { setSearch(next.search); setPrincipalPage(1); }

    logger.info("[students] filters_changed", {
      trace,
      sectionId: next.sectionId ?? sectionId,
      search: next.search ?? search,
    });
  };

  const sectionLabelById = useMemo(() => {
    const map = new Map<number, string>();
    (sectionsList.data ?? []).forEach((section: SectionDto) => {
      const classLabel = section.class_name ?? `Class #${section.class_id}`;
      map.set(section.id, `${classLabel} - ${section.name}`);
    });
    return map;
  }, [sectionsList.data]);

  const teacherFiltered = useMemo(() => {
    const list = teacherStudents.data ?? [];
    const text = search.trim().toLowerCase();
    if (!text) return list;
    return list.filter((student) => {
      const name = (student.name ?? "").toLowerCase();
      const roll = String(student.roll_no ?? "").toLowerCase();
      return name.includes(text) || roll.includes(text);
    });
  }, [teacherStudents.data, search]);

  const principalStudents = principalQuery.data;
  const principalPagination = {
    page: principalPage,
    setPage: setPrincipalPage,
    totalPages: principalQuery.totalPages,
    totalItems: principalQuery.total,
    pagedItems: principalStudents,
    pageSize: 20,
    from: principalQuery.total === 0 ? 0 : (principalPage - 1) * 20 + 1,
    to: principalQuery.total === 0 ? 0 : Math.min(principalPage * 20, principalQuery.total),
  };
  const teacherPagination = usePagination(teacherFiltered, {
    initialPageSize: 20,
    resetDeps: [search, teacherSectionId],
  });

  const openStudent = (student: StudentDto | StudentListItem) => {
    navigate(`/${navigateRole}/students/${student.public_id ?? student.id}`, {
      state: { breadcrumbLabel: student.name ?? "Student" },
    });
  };

  const viewStudent = (student: StudentDto) => {
    logger.info("[students] row_tap", {
      trace,
      studentId: student.id,
    });
    openStudent(student);
  };

  return {
    isTeacher,
    search,
    sectionId,
    sectionsList,
    sectionLabelById,
    teacherSection,
    teacherSectionId,
    teacherStudents,
    teacherFiltered,
    principalQuery,
    principalStudents,
    principalPagination,
    teacherPagination,
    onFilterChange,
    openStudent,
    viewStudent,
  };
}
