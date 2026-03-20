import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyTeachingAssignments } from "@/api/teachers.api";
import { queryKeys } from "@/constants/queryKeys";
import type { TeachingAssignmentMeDto } from "@/types/teachingAssignment.types";
import { useAuthStore } from "@/store/auth.store";

function extractSchoolId(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  const v = value as {
    school_id?: unknown;
    schoolId?: unknown;
    school?: { id?: unknown; school_id?: unknown } | null;
  };
  const direct =
    (typeof v.school_id === "number" && v.school_id) ||
    (typeof v.schoolId === "number" && v.schoolId);
  if (typeof direct === "number") return direct;
  const nested =
    (typeof v.school?.id === "number" && v.school.id) ||
    (typeof v.school?.school_id === "number" && v.school.school_id);
  return typeof nested === "number" ? nested : null;
}

export function useMyTeachingAssignments() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const setSchoolId = useAuthStore((s) => s.setSchoolId);
  const query = useQuery({
    queryKey: queryKeys.teacherMeAssignments(),
    queryFn: getMyTeachingAssignments,
    retry: 1,
  });

  useEffect(() => {
    if (schoolId) return;
    const assignmentSchoolId =
      query.data?.[0]?.school_id ?? extractSchoolId(query.data?.[0]);
    if (typeof assignmentSchoolId === "number") {
      setSchoolId(assignmentSchoolId);
    }
  }, [schoolId, query.data, setSchoolId]);

  return {
    data: query.data as TeachingAssignmentMeDto[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
