import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";

import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { useStudentsBySection } from "@/hooks/useStudentsBySection";
import { useAttendanceBySectionDate } from "@/hooks/useAttendanceBySectionDate";
import { useAttendanceSubmit } from "@/hooks/useAttendanceSubmit";
import { useCreateAttendanceRecord } from "@/hooks/useCreateAttendanceRecord";
import { useUpdateAttendance } from "@/hooks/useUpdateAttendance";
import { logger } from "@/utils/logger";
import { formatToday, formatIsoDate } from "@/utils/date";
import type { AttendanceStatusDto } from "@/types/attendance-submit.types";
import type { AttendanceRecordDto } from "@/types/attendance.types";

type StudentUi = {
  id: string;
  rollNo: string;
  name: string;
};

function normalizeStatus(status: AttendanceStatusDto): "PRESENT" | "ABSENT" {
  return status === "ABSENT" || status === "absent" ? "ABSENT" : "PRESENT";
}

function formatDateLabel(dateIso: string): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  if (!year || !month || !day) return formatToday();
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function MarkAttendance() {
  const [presentById, setPresentById] = useState<Record<string, boolean>>({});
  const {
    submit,
    isLoading: isSubmitting,
    error: submitError,
    reset: resetSubmitError,
  } = useAttendanceSubmit();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const todayIso = useMemo(() => formatIsoDate(new Date()), []);
  const [selectedDateIso] = useState(todayIso);
  const [editError, setEditError] = useState<string | null>(null);

  const trace = useMemo(() => logger.traceId(), []);
  const dateLabel = useMemo(
    () => formatDateLabel(selectedDateIso),
    [selectedDateIso],
  );
  const navigate = useNavigate();

  const section = useTeacherAttendanceSection();
  const sectionId = section.data?.section_id;

  const studentsQuery = useStudentsBySection(sectionId);
  const attendanceQuery = useAttendanceBySectionDate(
    sectionId,
    selectedDateIso,
  );
  const updateAttendance = useUpdateAttendance();
  const createAttendance = useCreateAttendanceRecord();
  const qc = useQueryClient();

  const isToday = selectedDateIso === todayIso;
  const isReadOnly = !isToday;

  useEffect(() => {
    logger.info("[teacher][attendance] loaded", { trace });
  }, [trace]);

  useEffect(() => {
    if (section.data) {
      logger.info("[teacher][attendance] section resolved", {
        trace,
        section_id: section.data.section_id,
        class_name: section.data.class_name,
        section_name: section.data.section_name,
      });
    }
  }, [section.data, trace]);

  useEffect(() => {
    if (studentsQuery.data) {
      logger.info("[teacher][attendance] students fetched", {
        trace,
        count: studentsQuery.data.length,
      });
    }
  }, [studentsQuery.data, trace]);

  useEffect(() => {
    if (!submitSuccess) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedirectCountdown(10);
    const interval = window.setInterval(() => {
      setRedirectCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 10000);
    const timeout = window.setTimeout(() => {
      navigate("/teacher", {
        replace: true,
        state: { toast: "Attendance submitted" },
      });
    }, 3000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [submitSuccess, navigate]);

  const sectionLabel = section.data
    ? `${section.data.class_name} - ${section.data.section_name}`
    : "";

  const students: StudentUi[] = useMemo(() => {
    const list = studentsQuery.data ?? [];
    return list.map((s, idx) => ({
      id: String(s.id),
      rollNo:
        s.roll_no != null
          ? String(s.roll_no)
          : String(idx + 1).padStart(2, "0"),
      name: s.name,
    }));
  }, [studentsQuery.data]);

  const attendanceMap = useMemo(() => {
    const m = new Map<
      number,
      { attendance_id: number; status: "PRESENT" | "ABSENT" }
    >();
    (attendanceQuery.data ?? []).forEach((r) => {
      m.set(r.student_id, {
        attendance_id: r.id,
        status: normalizeStatus(r.status),
      });
    });
    return m;
  }, [attendanceQuery.data]);

  // Hydrate/initialize based on fetched attendance
  useEffect(() => {
    if (!students.length) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPresentById((prev) => {
      const next = { ...prev };
      for (const s of students) {
        const existing = attendanceMap.get(Number(s.id));
        if (existing) {
          next[s.id] = existing.status !== "ABSENT";
        } else if (next[s.id] === undefined) {
          next[s.id] = true;
        }
      }
      return next;
    });
  }, [students, attendanceMap]);

  const updateAttendanceCache = (record: AttendanceRecordDto) => {
    if (!sectionId) return;
    qc.setQueryData<AttendanceRecordDto[]>(
      ["attendance", "section", sectionId, selectedDateIso],
      (prev) => {
        const list = prev ? [...prev] : [];
        const idx = list.findIndex((r) => r.id === record.id);
        if (idx >= 0) {
          list[idx] = record;
          return list;
        }
        return [...list, record];
      },
    );
  };

  const toggleStatus = (studentId: string) => {
    if (isReadOnly || !sectionId) return;

    setEditError(null);

    const wasPresent = presentById[studentId] !== false;
    const nextStatus: AttendanceStatusDto = wasPresent ? "ABSENT" : "PRESENT";
    setPresentById((prev) => ({ ...prev, [studentId]: !wasPresent }));

    const studentIdNum = Number(studentId);
    const existing = attendanceMap.get(studentIdNum);

    const handleError = (err: unknown) => {
      setPresentById((prev) => ({ ...prev, [studentId]: wasPresent }));
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const detail = (err.response?.data as { detail?: string })?.detail;
        const code = (err.response?.data as { code?: string })?.code;
        if (
          status === 403 &&
          (detail === "attendance_edit_not_allowed" ||
            code === "attendance_edit_not_allowed")
        ) {
          setEditError("Attendance can only be edited today.");
          return;
        }
      }
      setEditError("Unable to update attendance. Please try again.");
    };

    if (existing) {
      updateAttendance.mutate(
        { attendance_id: existing.attendance_id, status: nextStatus },
        {
          onSuccess: (data) => {
            updateAttendanceCache(data);
          },
          onError: handleError,
        },
      );
    } else {
      createAttendance.mutate(
        { student_id: studentIdNum, date: selectedDateIso, status: nextStatus },
        {
          onSuccess: (data: AttendanceRecordDto) => {
            updateAttendanceCache(data);
          },
          onError: handleError,
        },
      );
    }
  };

  const counts = useMemo(() => {
    const total = students.length;
    let present = 0;
    for (const s of students) if (presentById[s.id] !== false) present += 1;
    const absent = total - present;
    return { total, present, absent };
  }, [students, presentById]);

  const onSubmit = () => {
    if (!section.data?.section_id || isReadOnly) return;

    setSubmitSuccess(false);
    setRedirectCountdown(10);
    resetSubmitError?.();
    setEditError(null);

    const studentsForApi = (studentsQuery.data ?? []).map((s) => {
      const key = String(s.id);
      const isPresent = presentById[key] !== false;

      const status: AttendanceStatusDto = isPresent ? "PRESENT" : "ABSENT";
      return { studentId: s.id, status };
    });

    const studentsToCreate = studentsForApi.filter(
      (s) => !attendanceMap.has(s.studentId),
    );

    logger.info("[teacher][attendance] submit clicked", {
      trace,
      section_id: section.data.section_id,
      date: selectedDateIso,
      total: studentsForApi.length,
    });

    submit(
      {
        sectionId: section.data.section_id,
        dateIso: selectedDateIso,
        students: studentsToCreate,
        concurrency: 8,
      },
      {
        onSuccess: () => {
          setSubmitSuccess(true);
          logger.info("[teacher][attendance] submit success", {
            trace,
            section_id: section.data?.section_id,
            date: selectedDateIso,
          });
        },

        onError: (err) => {
          logger.warn("[teacher][attendance] submit failed", { trace, err });
        },
      },
    );
  };

  const isLoading =
    section.isLoading || studentsQuery.isLoading || attendanceQuery.isLoading;

  if (isLoading) {
    return <LoadingState label="Loading students..." />;
  }

  // Section errors (including 404 no_primary_section_assigned)
  if (section.error) {
    const status = axios.isAxiosError(section.error)
      ? section.error.response?.status
      : undefined;

    if (status === 404) {
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mx-auto w-full max-w-2xl">
            <ErrorState
              title="No attendance section assigned"
              message="Please contact management to assign your attendance section."
            />
            <button
              type="button"
              onClick={() => section.refetch()}
              className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            title="Attendance unavailable"
            message="Please try again."
          />
          <button
            type="button"
            onClick={() => section.refetch()}
            className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Students errors with retry
  if (studentsQuery.error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            title="Students unavailable"
            message="Please try again."
          />
          <button
            type="button"
            onClick={() => studentsQuery.refetch()}
            className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (attendanceQuery.error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            title="Attendance unavailable"
            message="Please try again."
          />
          <button
            type="button"
            onClick={() => attendanceQuery.refetch()}
            className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return <EmptyState message="No students found for this section." />;
  }

  // Replace the entire return statement from the attendance component

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 "
            onClick={() => navigate("/teacher")}
          >
            ← Back
          </button>
          <div className="text-base font-bold text-gray-900 tracking-tight">
            Mark Attendance
          </div>
          <div />
        </div>

        {/* Class Information Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {sectionLabel}
            </h1>
            <div className="mt-2 text-sm text-gray-600">
              Date:{" "}
              <span className="font-semibold text-gray-900">{dateLabel}</span>
            </div>
            {isReadOnly && (
              <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="text-xs font-medium text-amber-700">
                    Attendance is read-only for past dates
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Total Students:{" "}
              <span className="font-semibold text-gray-900">
                {counts.total}
              </span>
            </div>
            <div className="text-sm font-semibold text-gray-700">
              <span className="text-green-600">{counts.present} Present</span>,{" "}
              <span className="text-red-600">{counts.absent} Absent</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {editError && (
          <div className="mb-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-red-800">
                  {editError}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Students List Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 border-b border-gray-200 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <div className="col-span-2">Roll No</div>
            <div className="col-span-7">Student Name</div>
            <div className="col-span-3 text-right">Status</div>
          </div>

          {/* Students List */}
          <ul className="divide-y divide-gray-100">
            {students.map((s) => {
              const isPresent = presentById[s.id] !== false;

              return (
                <li
                  key={s.id}
                  className={isPresent ? "bg-white" : "bg-red-50/40"}
                >
                  <div className="grid grid-cols-12 items-center gap-3 px-6 py-4">
                    <div className="col-span-2">
                      <div className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1.5">
                        <span className="text-sm font-semibold text-gray-700">
                          {s.rollNo}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-7">
                      <div className="text-sm font-semibold text-gray-900">
                        {s.name}
                      </div>
                    </div>

                    <div className="col-span-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleStatus(s.id)}
                        disabled={isReadOnly}
                        className={`
                        h-11 min-w-[120px] rounded-full px-4 text-sm font-semibold
                        focus:outline-none focus:ring-2 focus:ring-blue-100
                        disabled:cursor-not-allowed disabled:opacity-60
                        transition-all duration-200
                        ${
                          isPresent
                            ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                            : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        }
                      `}
                        aria-label={
                          isPresent
                            ? `Mark ${s.name} absent`
                            : `Mark ${s.name} present`
                        }
                      >
                        {isPresent ? "Present" : "Absent"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {counts.total}
                </span>{" "}
                Students
              </div>
              <div className="text-sm font-semibold text-gray-700">
                <span className="text-green-600">{counts.present} Present</span>{" "}
                • <span className="text-red-600">{counts.absent} Absent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isReadOnly}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 transition-all duration-200"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting Attendance...
              </span>
            ) : (
              "Submit Attendance"
            )}
          </button>
        </div>

        {/* Error/Success Messages */}
        <div className="mt-4">
          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-red-800">
                    Failed to submit attendance
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSubmit}
                  className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {submitSuccess && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  Attendance submitted successfully!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keep the modal popups as they are (don't change these) */}
      {(isSubmitting || submitSuccess || submitError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            {isSubmitting ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
                <div className="mt-4 text-lg font-extrabold text-gray-900">
                  Saving attendance...
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Please wait while we update records.
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500" />
                </div>
              </>
            ) : null}

            {!isSubmitting && submitSuccess ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div className="mt-4 text-lg font-extrabold text-gray-900">
                  Attendance Saved!
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {sectionLabel
                    ? `${sectionLabel} records updated.`
                    : "Records updated."}
                </div>
                <div className="mt-4 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600">
                  Returning to dashboard... {redirectCountdown || 0}s
                </div>
                <button
                  type="button"
                  className="mt-4 h-11 w-full rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                  onClick={() =>
                    navigate("/teacher", {
                      replace: true,
                      state: { toast: "Attendance submitted" },
                    })
                  }
                >
                  Return Home Now
                </button>
                <div className="mt-3 text-xs text-gray-500">
                  Need changes? You can edit this record later.
                </div>
              </>
            ) : null}

            {!isSubmitting && !submitSuccess && submitError ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 8v5" />
                    <path d="M12 16h.01" />
                    <path d="M10.29 3.86l-7.4 12.82A2 2 0 004.6 20h14.8a2 2 0 001.71-3.32l-7.4-12.82a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div className="mt-4 text-lg font-extrabold text-gray-900">
                  Submit failed
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Please retry. Your selections are saved and not lost.
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="h-11 w-full rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                    onClick={onSubmit}
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    className="h-11 w-full rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    onClick={() => resetSubmitError?.()}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
