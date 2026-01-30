import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyAttendanceSection, getTeacherMe } from "@/api/teachers.api";
import type { AttendanceSection } from "@/types/attendance.types";
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

export function useTeacherAttendanceSection() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const setSchoolId = useAuthStore((s) => s.setSchoolId);
  const didFallbackRef = useRef(false);
  const query = useQuery({
    queryKey: ["teacher", "me", "attendance-section"],
    queryFn: getMyAttendanceSection,
  });

  useEffect(() => {
    const nextSchoolId =
      (query.data as AttendanceSection | undefined)?.school_id ??
      extractSchoolId(query.data);
    if (typeof nextSchoolId === "number" && nextSchoolId !== schoolId) {
      setSchoolId(nextSchoolId);
    }
  }, [query.data, schoolId, setSchoolId]);

  useEffect(() => {
    if (schoolId || didFallbackRef.current || !query.data) return;
    didFallbackRef.current = true;
    getTeacherMe()
      .then((me) => {
        if (typeof me.school_id === "number") {
          setSchoolId(me.school_id);
        }
      })
      .catch(() => {
        // leave fallback flagged to avoid loops
      });
  }, [schoolId, query.data, setSchoolId]);

  return {
    data: query.data as AttendanceSection | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
