import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCheckCircle } from "react-icons/fi";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { IoTimeOutline } from "react-icons/io5";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { useMyTeachingAssignments } from "@/hooks/useMyTeachingAssignments";
import { logger } from "@/utils/logger";

export function TeacherDashboard() {
  const navigate = useNavigate();
  const trace = useMemo(() => logger.traceId(), []);

  const { data, isLoading, error, refetch } = useTeacherAttendanceSection();
  const assignmentsQuery = useMyTeachingAssignments();
  const location = useLocation();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const msg = (location.state as any)?.toast as string | undefined;
    if (msg) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToast(msg);
      // Clear navigation state so it doesn't re-show on future navigations
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    logger.info("[teacher][dashboard] loaded", { trace });
  }, [trace]);

  useEffect(() => {
    if (data) {
      logger.info("[teacher][dashboard] section resolved", {
        trace,
        class_name: data.class_name,
        section_name: data.section_name,
        section_id: data.section_id,
      });
    }
  }, [data, trace]);

  if (isLoading) {
    return <LoadingState label="Loading your section..." />;
  }

  if (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
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
              onClick={() => refetch()}
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
            title="Dashboard unavailable"
            message="Unable to load your attendance section. Please try again."
          />
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            title="No attendance section assigned"
            message="Please contact management to assign your attendance section."
          />
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sectionLabel = `${data.class_name} - ${data.section_name}`;
  const assignments = assignmentsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {toast ? (
        <div className="mx-auto mb-4 w-full max-w-5xl rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          <div className="flex items-center justify-between gap-3">
            <span>{toast}</span>
            <button
              type="button"
              className="rounded-lg px-3 py-1 text-sm font-semibold text-green-900 hover:bg-green-100"
              onClick={() => setToast(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
            <HiOutlineAcademicCap className="h-5 w-5" />
            Welcome back
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            Have a great day of teaching!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your next actions are ready below.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <IoTimeOutline className="h-4 w-4" />
              Today's Schedule
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {assignmentsQuery.isLoading ? (
              <div className="px-6 py-6">
                <LoadingState label="Loading schedule..." />
              </div>
            ) : assignmentsQuery.error ? (
              <div className="px-6 py-6">
                <ErrorState
                  title="Unable to load schedule"
                  message="Please try again."
                />
              </div>
            ) : assignments.length === 0 ? (
              <div className="px-6 py-6 text-sm text-gray-600">
                No teaching assignments found yet.
              </div>
            ) : (
              assignments.map((a) => (
                <div
                  key={`${a.section_id}-${a.subject_id}`}
                  className="px-6 py-4"
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {a.class_name} - {a.subject_name}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Section {a.section_name}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => navigate("/teacher/attendance")}
            className="flex w-full items-center justify-between rounded-full bg-blue-600 px-5 py-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <FiCheckCircle className="h-4 w-4" />
              </span>
              Mark Attendance
            </span>
            <span>→</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/teacher/marks")}
            className="flex w-full items-center justify-between rounded-full bg-blue-600 px-5 py-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <HiOutlineAcademicCap className="h-4 w-4" />
              </span>
              Enter Marks
            </span>
            <span>→</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/teacher/notes")}
            className="flex w-full items-center justify-between rounded-full bg-blue-600 px-5 py-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <HiOutlineAcademicCap className="h-4 w-4" />
              </span>
              Write Student Note
            </span>
            <span>→</span>
          </button>
        </div>
      </main>
    </div>
  );
}
