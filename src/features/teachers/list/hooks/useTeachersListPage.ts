import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePrincipalTeachers } from "@/hooks/usePrincipalTeachers";
import { useAuthStore } from "@/store/auth.store";
import type { TeacherDto } from "@/types/teacher.types";
import { logger } from "@/utils/logger";

import {
  filterTeachers,
  getAllAssignmentLabels,
} from "../helpers/teachersList.helpers";
import type { TeachersExpandedAssignments } from "../types/teachersList.types";

export function useTeachersListPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
  const [expandedAssignments, setExpandedAssignments] =
    useState<TeachersExpandedAssignments>({});
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const navigateRole = role ?? "teacher";

  const query = usePrincipalTeachers();
  const isManagement = role === "management";

  const allAssignments = useMemo(
    () => getAllAssignmentLabels(query.data ?? []),
    [query.data],
  );

  const filtered = useMemo(
    () =>
      filterTeachers({
        teachers: query.data ?? [],
        search,
        statusFilter,
        subjectFilter,
      }),
    [query.data, search, statusFilter, subjectFilter],
  );

  const onSearchChange = (value: string) => {
    setSearch(value);
    logger.info("[teachers] search_changed", {
      trace,
      length: value.length,
    });
  };

  const toggleAssignments = (teacherId: number) => {
    setExpandedAssignments((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  const openTeacher = (teacher: TeacherDto) => {
    const name = teacher.name ?? `Teacher #${teacher.id}`;
    navigate(`/${navigateRole}/teachers/${teacher.id}`, {
      state: { breadcrumbLabel: name },
    });
  };

  const viewTeacher = (teacher: TeacherDto) => {
    logger.info("[teachers] row_tap", {
      trace,
      teacherId: teacher.id,
    });
    openTeacher(teacher);
  };

  return {
    search,
    statusFilter,
    subjectFilter,
    expandedAssignments,
    isManagement,
    query,
    allAssignments,
    filtered,
    setStatusFilter,
    setSubjectFilter,
    onSearchChange,
    toggleAssignments,
    openTeacher,
    viewTeacher,
    onAddTeacher: () => navigate("/management/setup/teachers"),
  };
}
