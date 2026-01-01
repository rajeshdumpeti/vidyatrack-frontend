import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "../../../components/feedback/EmptyState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";

import { useTeacherAttendanceSection } from "../../../hooks/useTeacherAttendanceSection";
import { useStudentsBySection } from "../../../hooks/useStudentsBySection";
import { logger } from "../../../utils/logger";
import { formatToday, formatIsoDate } from "../../../utils/date";
import { useAttendanceSubmit } from "../../../hooks/useAttendanceSubmit";
import type { AttendanceStatusDto } from "../../../types/attendance-submit.types";

type StudentUi = {
  id: string;
  rollNo: string;
  name: string;
};

export function MarkAttendance() {
  const [presentById, setPresentById] = useState<Record<string, boolean>>({});
  const {
    submit,
    isLoading: isSubmitting,
    error: submitError,
    reset: resetSubmitError,
  } = useAttendanceSubmit();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const todayIso = useMemo(() => formatIsoDate(new Date()), []);

  const trace = useMemo(() => logger.traceId(), []);
  const todayLabel = formatToday();
  const navigate = useNavigate();

  const section = useTeacherAttendanceSection();
  const sectionId = section.data?.section_id;

  const studentsQuery = useStudentsBySection(sectionId);

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

  // Default all to Present (only initialize new IDs, keep toggles)
  useEffect(() => {
    if (!students.length) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPresentById((prev) => {
      const next = { ...prev };
      for (const s of students) {
        if (next[s.id] === undefined) next[s.id] = true;
      }
      return next;
    });
  }, [students]);

  const toggleStatus = (studentId: string) => {
    setPresentById((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const counts = useMemo(() => {
    const total = students.length;
    let present = 0;
    for (const s of students) if (presentById[s.id] !== false) present += 1;
    const absent = total - present;
    return { total, present, absent };
  }, [students, presentById]);

  const onSubmit = () => {
    if (!section.data?.section_id) return;

    setSubmitSuccess(false);
    resetSubmitError?.();

    const studentsForApi = (studentsQuery.data ?? []).map((s) => {
      const key = String(s.id);
      const isPresent = presentById[key] !== false;

      const status: AttendanceStatusDto = isPresent ? "PRESENT" : "ABSENT";
      return { studentId: s.id, status };
    });

    logger.info("[teacher][attendance] submit clicked", {
      trace,
      section_id: section.data.section_id,
      date: todayIso,
      total: studentsForApi.length,
    });

    submit(
      {
        sectionId: section.data.section_id,
        dateIso: todayIso,
        students: studentsForApi,
        concurrency: 8,
      },
      {
        onSuccess: () => {
          setSubmitSuccess(true);
          logger.info("[teacher][attendance] submit success", {
            trace,
            section_id: section.data?.section_id,
            date: todayIso,
          });
          navigate("/teacher", {
            replace: true,
            state: { toast: "Attendance submitted" },
          });
        },

        onError: (err) => {
          logger.warn("[teacher][attendance] submit failed", { trace, err });
        },
      }
    );
  };

  const isLoading = section.isLoading || studentsQuery.isLoading;

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

  if (students.length === 0) {
    return <EmptyState message="No students found for this section." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gray-50 px-4 pt-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="text-3xl font-extrabold tracking-tight text-gray-900">
            {sectionLabel}
          </div>
          <div className="mt-2 text-sm font-medium text-gray-600">
            Date:{" "}
            <span className="font-semibold text-gray-900">{todayLabel}</span>
          </div>
          <div className="mt-1 text-sm font-medium text-gray-600">
            Total Students:{" "}
            <span className="font-semibold text-gray-900">{counts.total}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-3 border-b border-gray-200 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <div className="col-span-2">Roll No</div>
            <div className="col-span-7">Student Name</div>
            <div className="col-span-3 text-right">Status</div>
          </div>

          <ul className="divide-y divide-gray-100">
            {students.map((s) => {
              const isPresent = presentById[s.id] !== false;

              return (
                <li
                  key={s.id}
                  className={isPresent ? "bg-white" : "bg-red-50/40"}
                >
                  <div className="grid grid-cols-12 items-center gap-3 px-4 py-4">
                    <div className="col-span-2 text-sm font-semibold text-gray-700">
                      {s.rollNo}
                    </div>

                    <div className="col-span-7 min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {s.name}
                      </div>
                    </div>

                    <div className="col-span-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleStatus(s.id)}
                        className={[
                          "h-11 min-w-[120px] rounded-full px-4 text-sm font-semibold",
                          "focus:outline-none focus:ring-2 focus:ring-blue-100",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                          isPresent
                            ? "border border-blue-200 bg-blue-50 text-blue-700"
                            : "border border-red-200 bg-red-50 text-red-700",
                        ].join(" ")}
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

          <div className="px-4 py-3 text-center text-sm text-gray-500">
            Showing {counts.total} Students
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="text-sm font-semibold text-gray-700">
            <span className="text-gray-900">{counts.present}</span>{" "}
            <span className="font-medium text-gray-500">Present</span>,{" "}
            <span className="text-red-700">{counts.absent}</span>{" "}
            <span className="font-medium text-gray-500">Absent</span>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="h-12 min-w-[180px] rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Attendance"}
          </button>
        </div>
      </div>
      <div className="mt-2 text-right text-sm">
        {submitSuccess ? (
          <span className="font-semibold text-green-700">
            Attendance submitted successfully.
          </span>
        ) : null}

        {submitError ? (
          <div className="mt-2">
            <ErrorState title="Submit failed" message="Please try again." />
            <button
              type="button"
              onClick={onSubmit}
              className="mt-2 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
              disabled={isSubmitting}
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
