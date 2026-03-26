import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTeacherStatus } from "@/api/teachers.api";
import { usePrincipalTeachers } from "@/hooks/usePrincipalTeachers";
import { useAuthStore } from "@/store/auth.store";
import type { TeacherDto, TeacherStatus } from "@/types/teacher.types";
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
  const [updatingTeacherId, setUpdatingTeacherId] = useState<number | null>(null);
  const [substituteTarget, setSubstituteTarget] = useState<TeacherDto | null>(null);

  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const schoolId = useAuthStore((state) => state.schoolId);
  const navigateRole = role ?? "teacher";
  const qc = useQueryClient();

  const query = usePrincipalTeachers();
  const isManagement = role === "management";

  const statusMutation = useMutation({
    mutationFn: ({ teacherId, status }: { teacherId: number; status: TeacherStatus }) =>
      updateTeacherStatus(teacherId, schoolId!, status),
    onMutate: ({ teacherId }) => setUpdatingTeacherId(teacherId),
    onSettled: () => {
      setUpdatingTeacherId(null);
      // Invalidate all teacher-related queries
      void qc.invalidateQueries({ queryKey: ["principal-teachers"] });
      void qc.invalidateQueries({ queryKey: ["teachers"] });
    },
  });

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
    logger.info("[teachers] search_changed", { trace, length: value.length });
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

  const onStatusChange = (teacherId: number, status: TeacherStatus) => {
    logger.info("[teachers] status_change", { trace, teacherId, status });
    statusMutation.mutate({ teacherId, status });
  };

  return {
    search,
    statusFilter,
    subjectFilter,
    expandedAssignments,
    updatingTeacherId,
    isManagement,
    schoolId,
    query,
    allTeachers: query.data ?? [],
    allAssignments,
    filtered,
    setStatusFilter,
    setSubjectFilter,
    onSearchChange,
    toggleAssignments,
    openTeacher,
    onStatusChange,
    substituteTarget,
    setSubstituteTarget,
    onAssignSubstitute: (teacher: TeacherDto) => setSubstituteTarget(teacher),
    onAddTeacher: () => navigate("/management/setup/teachers"),
  };
}
