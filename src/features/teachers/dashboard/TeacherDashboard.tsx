import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCheckCircle } from "react-icons/fi";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { IoTimeOutline } from "react-icons/io5";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { logger } from "@/utils/logger";

export function TeacherDashboard() {
  const navigate = useNavigate();
  const trace = useMemo(() => logger.traceId(), []);

  const { data, isLoading, error, refetch } = useTeacherAttendanceSection();
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

  // Replace only placeholder section with API-backed value (no other UX/copy changes)
  const sectionLabel = `${data.class_name} - ${data.section_name}`;

  // Still not backed by API (do not guess contracts)
  const subjectLabel = "Current Session";
  const timeLabel = "Today";

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
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
          Current Session
        </h1>
        <p className="mt-2 text-base font-medium text-gray-600">
          Your next action is waiting below.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl shadow-lg">
          <div className="relative bg-linear-to-br from-slate-700 via-slate-700 to-slate-900 px-6 py-8">
            <div className="absolute inset-0 opacity-20" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-slate-200">
                <div className="inline-flex items-center gap-2">
                  <IoTimeOutline className="h-5 w-5" />
                  {timeLabel}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-4xl font-extrabold tracking-tight text-white">
                    {subjectLabel} <span className="text-white/70">|</span>{" "}
                    {sectionLabel}
                  </div>

                  <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200">
                    <HiOutlineAcademicCap className="h-5 w-5 text-slate-200" />
                    Your Attendance Section is already set for today.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/teacher/attendance")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                    <FiCheckCircle className="h-4 w-4" />
                  </span>
                  Mark Attendance
                </button>
              </div>
            </div>
          </div>

          <div className="h-1 w-full bg-blue-600" />
        </div>
      </main>
    </div>
  );
}
