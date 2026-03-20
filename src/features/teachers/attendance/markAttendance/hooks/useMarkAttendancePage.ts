import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useAttendanceBySectionDate } from "@/hooks/useAttendanceBySectionDate";
import { useAttendanceSubmit } from "@/hooks/useAttendanceSubmit";
import { useCreateAttendanceRecord } from "@/hooks/useCreateAttendanceRecord";
import { usePagination } from "@/hooks/usePagination";
import { useStudentsBySection } from "@/hooks/useStudentsBySection";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { useUpdateAttendance } from "@/hooks/useUpdateAttendance";
import { useAuthStore } from "@/store/auth.store";
import type { AttendanceStatusDto } from "@/types/attendance-submit.types";
import type { AttendanceRecordDto } from "@/types/attendance.types";
import { formatIsoDate } from "@/utils/date";

import { normalizeAttendanceStatus } from "../helpers/markAttendance.helpers";
import { buildAttendanceStudents, getAttendanceCounts } from "../utils/markAttendance.utils";

export function useMarkAttendancePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const schoolId = useAuthStore((state) => state.schoolId);
  const setSchoolId = useAuthStore((state) => state.setSchoolId);

  const [presentById, setPresentById] = useState<Record<string, boolean>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const todayIso = useMemo(() => formatIsoDate(new Date()), []);
  const [selectedDateIso] = useState(todayIso);

  const {
    submit,
    isPending: isSubmitting,
    error: submitError,
    reset: resetSubmitError,
  } = useAttendanceSubmit();

  const section = useTeacherAttendanceSection();
  const sectionId = location.state?.section_id || section.data?.section_id;
  const className =
    location.state?.class_name || section.data?.class_name || "Class";
  const sectionName =
    location.state?.section_name || section.data?.section_name || "Section";
  const subjectName =
    location.state?.subject_name || section.data?.subject_name || "Subject";

  const studentsQuery = useStudentsBySection(sectionId);
  const attendanceQuery = useAttendanceBySectionDate(
    sectionId,
    selectedDateIso,
    schoolId,
  );
  const updateAttendance = useUpdateAttendance();
  const createAttendance = useCreateAttendanceRecord();

  const isToday = selectedDateIso === todayIso;
  const isReadOnly = !isToday;

  useEffect(() => {
    if (!schoolId && typeof section.data?.school_id === "number") {
      setSchoolId(section.data.school_id);
    }
  }, [schoolId, section.data?.school_id, setSchoolId]);

  useEffect(() => {
    if (!submitSuccess) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedirectCountdown(5);
    const interval = window.setInterval(() => {
      setRedirectCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    const timeout = window.setTimeout(() => {
      navigate("/teacher", {
        replace: true,
        state: {
          toast: `Attendance submitted for ${section.data?.class_name} ${section.data?.section_name}`,
        },
      });
    }, 5000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [submitSuccess, navigate, section.data?.class_name, section.data?.section_name]);

  const sectionLabel = location.state?.section_id
    ? `${location.state.class_name || "Class"} - ${location.state.section_name || location.state.subject_name}`
    : section.data
      ? `${section.data.class_name} - ${section.data.section_name}`
      : "Loading Section...";

  const students = useMemo(
    () => buildAttendanceStudents(studentsQuery.data ?? []),
    [studentsQuery.data],
  );

  const studentsPagination = usePagination(students, {
    initialPageSize: 20,
    resetDeps: [sectionId, selectedDateIso],
  });

  const attendanceMap = useMemo(() => {
    const map = new Map<number, { attendance_id: number; status: "PRESENT" | "ABSENT" }>();
    (attendanceQuery.data ?? []).forEach((record) => {
      map.set(record.student_id, {
        attendance_id: record.id,
        status: normalizeAttendanceStatus(record.status),
      });
    });
    return map;
  }, [attendanceQuery.data]);

  useEffect(() => {
    if (!students.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPresentById((prev) => {
      const next = { ...prev };
      for (const student of students) {
        const existing = attendanceMap.get(Number(student.id));
        if (existing) {
          next[student.id] = existing.status !== "ABSENT";
        } else if (next[student.id] === undefined) {
          next[student.id] = true;
        }
      }
      return next;
    });
  }, [students, attendanceMap]);

  const updateAttendanceCache = (record: AttendanceRecordDto) => {
    if (!sectionId) return;

    queryClient.setQueryData<AttendanceRecordDto[]>(
      ["attendance", "section", sectionId, selectedDateIso],
      (prev) => {
        const list = prev ? [...prev] : [];
        const index = list.findIndex((item) => item.id === record.id);
        if (index >= 0) {
          list[index] = record;
          return list;
        }
        return [...list, record];
      },
    );
  };

  const toggleStatus = (studentId: string) => {
    if (isReadOnly || !sectionId || !schoolId) return;

    const wasPresent = presentById[studentId] !== false;
    const nextStatus: AttendanceStatusDto = wasPresent ? "ABSENT" : "PRESENT";
    setPresentById((prev) => ({ ...prev, [studentId]: !wasPresent }));

    const studentIdNumber = Number(studentId);
    const existing = attendanceMap.get(studentIdNumber);

    const handleError = (error: unknown) => {
      setPresentById((prev) => ({ ...prev, [studentId]: wasPresent }));
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const detail = (error.response?.data as { detail?: string })?.detail;
        const code = (error.response?.data as { code?: string })?.code;
        if (
          status === 403 &&
          (detail === "attendance_edit_not_allowed" ||
            code === "attendance_edit_not_allowed")
        ) {
          return;
        }
      }
    };

    if (existing) {
      updateAttendance.mutate(
        {
          attendance_id: existing.attendance_id,
          status: nextStatus,
          student_id: studentIdNumber,
          school_id: schoolId,
          date: selectedDateIso,
        },
        {
          onSuccess: (data) => {
            updateAttendanceCache(data);
          },
          onError: handleError,
        },
      );
      return;
    }

    createAttendance.mutate(
      { student_id: studentIdNumber, date: selectedDateIso, status: nextStatus },
      {
        onSuccess: (data: AttendanceRecordDto) => {
          updateAttendanceCache(data);
        },
        onError: handleError,
      },
    );
  };

  const counts = useMemo(
    () => getAttendanceCounts(students, presentById),
    [students, presentById],
  );

  const submitAttendance = () => {
    if (!sectionId || isReadOnly) return;

    setSubmitSuccess(false);
    resetSubmitError?.();
    const studentsForApi = students.map((student) => ({
      studentId: Number(student.id),
      status:
        presentById[student.id] !== false
          ? "PRESENT"
          : ("ABSENT" as AttendanceStatusDto),
    }));

    submit(
      {
        sectionId,
        dateIso: selectedDateIso,
        students: studentsForApi,
        concurrency: 8,
      },
      { onSuccess: () => setSubmitSuccess(true) },
    );
  };

  return {
    className,
    sectionName,
    subjectName,
    sectionLabel,
    sectionLoading: section.isLoading,
    studentsLoading: studentsQuery.isLoading,
    attendanceLoading: attendanceQuery.isLoading,
    students,
    pagination: studentsPagination,
    presentById,
    isReadOnly,
    toggleStatus,
    counts,
    submitAttendance,
    isSubmitting,
    submitSuccess,
    submitError: Boolean(submitError),
    redirectCountdown,
    resetSubmitError,
    navigateHome: () =>
      navigate("/teacher", {
        replace: true,
        state: { toast: `Attendance submitted for ${sectionLabel}` },
      }),
  };
}
