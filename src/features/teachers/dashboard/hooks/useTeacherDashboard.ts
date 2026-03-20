import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getTeacherMe } from "@/api/teachers.api";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { useMyTeachingAssignments } from "@/hooks/useMyTeachingAssignments";
import { useTeacherReadiness } from "@/hooks/useTeacherReadiness";
import { useAuthStore } from "@/store/auth.store";
import type { TeachingAssignmentMeDto } from "@/types/teachingAssignment.types";
import { logger } from "@/utils/logger";

import { getTeacherDisplayName } from "../utils/getTeacherDisplayName";
import type { TeacherDashboardState } from "../types/teacherDashboard.types";

export function useTeacherDashboard(): TeacherDashboardState {
  const navigate = useNavigate();
  const location = useLocation();
  const trace = useMemo(() => logger.traceId(), []);
  const setSchoolId = useAuthStore((state) => state.setSchoolId);

  const teacherMeQuery = useQuery({
    queryKey: ["teacher", "me"],
    queryFn: getTeacherMe,
    retry: 1,
  });
  const attendanceSection = useTeacherAttendanceSection();
  const assignmentsQuery = useMyTeachingAssignments();
  const readiness = useTeacherReadiness();

  const [toast, setToast] = useState<string | null>(null);
  const [activeAssignment, setActiveAssignment] =
    useState<TeachingAssignmentMeDto | null>(null);

  useEffect(() => {
    const state = location.state as { toast?: string } | null;
    if (!state?.toast) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToast(state.toast);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    logger.info("[teacher][dashboard] loaded", { trace });
  }, [trace]);

  useEffect(() => {
    if (typeof attendanceSection.data?.school_id === "number") {
      setSchoolId(attendanceSection.data.school_id);
    }
  }, [attendanceSection.data?.school_id, setSchoolId]);

  useEffect(() => {
    if (typeof readiness.data?.school_id === "number") {
      setSchoolId(readiness.data.school_id);
    }
  }, [readiness.data?.school_id, setSchoolId]);

  const handleAction = (route: string) => {
    if (!activeAssignment) return;
    navigate(route, { state: activeAssignment });
  };

  return {
    teacherName: getTeacherDisplayName(teacherMeQuery.data),
    toast,
    activeAssignment,
    assignments: assignmentsQuery.data ?? [],
    assignmentsLoading: assignmentsQuery.isLoading,
    readiness,
    attendanceSection,
    dismissToast: () => setToast(null),
    selectAssignment: (assignment: TeachingAssignmentMeDto) =>
      setActiveAssignment(assignment),
    handleAction,
    refetchAll: () => {
      readiness.refetch();
      attendanceSection.refetch();
      assignmentsQuery.refetch();
    },
  };
}
