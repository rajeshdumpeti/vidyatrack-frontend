import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { IoTimeOutline } from "react-icons/io5";
import {
  BsCheckCircleFill,
  BsFillFileEarmarkTextFill,
  BsFillPencilFill,
} from "react-icons/bs";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { useMyTeachingAssignments } from "@/hooks/useMyTeachingAssignments";
import { useTeacherReadiness } from "@/hooks/useTeacherReadiness";
import { getTeacherMe } from "@/api/teachers.api";
import { logger } from "@/utils/logger";
import { useAuthStore } from "@/store/auth.store";

export function TeacherDashboard() {
  const navigate = useNavigate();
  const trace = useMemo(() => logger.traceId(), []);
  const setSchoolId = useAuthStore((s) => s.setSchoolId);
  const teacherMeQuery = useQuery({
    queryKey: ["teacher", "me"],
    queryFn: getTeacherMe,
    retry: 1,
  });
  const readiness = useTeacherReadiness();
  const teacherName =
    teacherMeQuery.data?.name?.trim() ||
    teacherMeQuery.data?.phone ||
    "Teacher";

  const { data, isLoading, error, refetch } = useTeacherAttendanceSection();
  const assignmentsQuery = useMyTeachingAssignments();
  const location = useLocation();
  const [toast, setToast] = useState<string | null>(null);

  // --- NEW STATE FOR SELECTION FLOW ---
  const [activeAssignment, setActiveAssignment] = useState<any>(null);

  useEffect(() => {
    const msg = (location.state as any)?.toast as string | undefined;
    if (msg) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToast(msg);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    logger.info("[teacher][dashboard] loaded", { trace });
  }, [trace]);

  useEffect(() => {
    if (typeof data?.school_id === "number") {
      setSchoolId(data.school_id);
    }
  }, [data?.school_id, setSchoolId]);

  useEffect(() => {
    if (typeof readiness.data?.school_id === "number") {
      setSchoolId(readiness.data.school_id);
    }
  }, [readiness.data?.school_id, setSchoolId]);

  if (isLoading || readiness.isLoading) {
    return <LoadingState label="Loading your section..." />;
  }

  if (readiness.data && readiness.data.status !== "ready") {
    const messages: Record<string, string> = {
      needs_school_mapping: "Your school access mapping is pending.",
      needs_primary_section: "Primary section is not assigned yet.",
      needs_subject_assignment: "No subject assignment found for your profile.",
      needs_students: "No students are enrolled in your primary section.",
      needs_teacher_profile: "Teacher profile has not been created.",
    };

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            title="Teacher setup in progress"
            message={
              messages[readiness.data.status] ??
              "Your teacher account setup is incomplete."
            }
          />
          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
            {readiness.data.recommended_next_action ??
              "Please contact management to complete setup."}
          </div>
          <button
            type="button"
            onClick={() => {
              readiness.refetch();
              refetch();
              assignmentsQuery.refetch();
            }}
            className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle Error States
  if (error || !data) {
    const is404 = axios.isAxiosError(error) && error.response?.status === 404;
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            title={
              is404 ? "No attendance section assigned" : "Dashboard unavailable"
            }
            message={
              is404
                ? "Please contact management to assign your attendance section."
                : "Unable to load data. Please try again."
            }
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

  const assignments = assignmentsQuery.data ?? [];

  // Helper for navigation with state
  const handleAction = (route: string) => {
    if (!activeAssignment) return;
    navigate(route, { state: activeAssignment });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {toast && (
        <div className="mx-auto mb-4 w-full max-w-4xl px-4 pt-6">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            <span>{toast}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-green-900 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        {/* Personalized Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
            <HiOutlineAcademicCap className="h-5 w-5" />
            Welcome {teacherName}!
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
            Have a great day of teaching!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your next actions are ready below.
          </p>
        </div>

        {/* Schedule Card */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <IoTimeOutline className="h-4 w-4" />
              Today's Schedule
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {assignmentsQuery.isLoading ? (
              <div className="p-10">
                <LoadingState label="Loading schedule..." />
              </div>
            ) : assignments.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500 font-medium">
                No teaching assignments found.
              </div>
            ) : (
              assignments.map((a) => {
                const isActive =
                  activeAssignment?.section_id === a.section_id &&
                  activeAssignment?.subject_name === a.subject_name;
                return (
                  <button
                    key={`${a.section_id}-${a.subject_name}`}
                    type="button"
                    onClick={() => setActiveAssignment(a)}
                    className={`w-full px-6 py-5 text-left transition-all ${isActive ? "bg-blue-50/60" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className={`text-[15px] font-bold ${isActive ? "text-blue-700" : "text-gray-900"}`}
                        >
                          {a.class_name} - {a.subject_name}
                        </div>
                        <div className="mt-1 text-xs font-medium text-gray-500">
                          Section {a.section_name} • Click to select
                        </div>
                      </div>
                      {isActive ? (
                        <BsCheckCircleFill className="h-5 w-5 text-blue-600" />
                      ) : (
                        <span className="text-blue-400 opacity-0 group-hover:opacity-100">
                          →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 space-y-4">
          <button
            type="button"
            disabled={!activeAssignment}
            onClick={() => handleAction("/teacher/attendance")}
            className={`flex w-full items-center justify-between rounded-2xl px-6 py-5 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] ${
              activeAssignment
                ? "bg-[#2D54E8] hover:bg-[#2546C1]"
                : "bg-gray-400 cursor-not-allowed opacity-60"
            }`}
          >
            <span className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <BsCheckCircleFill className="h-5 w-5" />
              </div>
              Mark Attendance{" "}
              {activeAssignment && `(${activeAssignment.class_name})`}
            </span>
            <span className="text-xl">→</span>
          </button>

          <button
            type="button"
            disabled={!activeAssignment}
            onClick={() => handleAction("/teacher/marks")}
            className={`flex w-full items-center justify-between rounded-2xl px-6 py-5 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] ${
              activeAssignment
                ? "bg-[#2D54E8] hover:bg-[#2546C1]"
                : "bg-gray-400 cursor-not-allowed opacity-60"
            }`}
          >
            <span className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <BsFillFileEarmarkTextFill className="h-5 w-5" />
              </div>
              Enter Marks{" "}
              {activeAssignment && `(${activeAssignment.class_name})`}
            </span>
            <span className="text-xl">→</span>
          </button>

          <button
            type="button"
            disabled={!activeAssignment}
            onClick={() => handleAction("/teacher/notes")}
            className={`flex w-full items-center justify-between rounded-2xl px-6 py-5 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] ${
              activeAssignment
                ? "bg-[#2D54E8] hover:bg-[#2546C1]"
                : "bg-gray-400 cursor-not-allowed opacity-60"
            }`}
          >
            <span className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <BsFillPencilFill className="h-4 w-4" />
              </div>
              Write Student Note
              {activeAssignment && `(${activeAssignment.class_name})`}
            </span>
            <span className="text-xl">→</span>
          </button>
        </div>

        <footer className="mt-16 text-center text-xs font-medium text-gray-400">
          School Management System © 2026. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
