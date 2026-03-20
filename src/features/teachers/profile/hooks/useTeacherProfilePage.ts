import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useTeacherById } from "@/hooks/useTeacherById";
import { logger } from "@/utils/logger";

import { getTeacherProfileViewModel } from "../utils/teacherProfile.utils";

export function useTeacherProfilePage() {
  const trace = useMemo(() => logger.traceId(), []);
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const teacherId = Number(params.teacherId);
  const teacherQuery = useTeacherById(teacherId);
  const viewModel = teacherQuery.teacher
    ? getTeacherProfileViewModel(teacherQuery.teacher)
    : null;

  useEffect(() => {
    if (!teacherQuery.teacher?.name) return;
    navigate(location.pathname, {
      replace: true,
      state: { breadcrumbLabel: teacherQuery.teacher.name },
    });
  }, [teacherQuery.teacher?.name, navigate, location.pathname]);

  useEffect(() => {
    if (!teacherQuery.teacher) return;
    logger.info("[teacher-profile] loaded", { trace, teacherId });
  }, [teacherId, teacherQuery.teacher, trace]);

  return {
    teacherId,
    ...teacherQuery,
    viewModel,
  };
}
