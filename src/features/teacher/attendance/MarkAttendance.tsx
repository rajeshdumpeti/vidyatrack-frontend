// src/features/teacher/attendance/MarkAttendance.tsx
import { useMemo, useState, useEffect, type ReactNode } from "react";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { useQuery } from "@tanstack/react-query";
import { getMyAttendanceSection } from "../../../api/teachers.api";
import { getStudentsBySection } from "../../../api/students.api";
import axios from "axios";

type UiState = "loading" | "error" | "empty" | "ready";

function formatToday(): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());
}

export function MarkAttendance() {
  // UI-only: change this locally to validate skeleton states
  const [uiState] = useState<UiState>("ready");
  const [presentById, setPresentById] = useState<Record<string, boolean>>({});
  // UI-only mocks (single section per pilot rule)

  const todayLabel = formatToday();

  const sectionQuery = useQuery({
    queryKey: ["teacher", "me", "attendance-section"],
    queryFn: getMyAttendanceSection,
  });
  // 2) students (depends on section_id)
  const studentsQuery = useQuery({
    queryKey: ["students", "by-section", sectionQuery.data?.section_id],
    queryFn: () => getStudentsBySection(sectionQuery.data!.section_id),
    enabled: !!sectionQuery.data?.section_id,
  });

  const sectionLabel = sectionQuery.data
    ? `${sectionQuery.data.class_name} - ${sectionQuery.data.section_name}`
    : "";
  const students = useMemo(() => {
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

  useEffect(() => {
    if (!students.length) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPresentById((prev) => {
      // Do not reset existing toggles; only initialize new students
      const next = { ...prev };
      for (const s of students) {
        if (next[s.id] === undefined) next[s.id] = true;
      }
      return next;
    });
  }, [students]);

  const toggleStatus = (studentId: string, p0: string) => {
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
    // UI-only: no API
    const absentStudentIds = students
      .filter((s) => presentById[s.id] === false)
      .map((s) => s.id);

    console.log("[teacher][attendance] submit (UI-only)", {
      section: sectionLabel,
      date: todayLabel,
      absentStudentIds,
    });
  };

  if (uiState === "loading")
    return <LoadingState label="Loading students..." />;
  if (uiState === "error")
    return (
      <ErrorState title="Attendance unavailable" message="Please try again." />
    );
  if (uiState === "empty")
    return <EmptyState message="No students found for this section." />;

  const isLoading = sectionQuery.isLoading || studentsQuery.isLoading;

  if (isLoading) return <LoadingState label="Loading students..." />;

  if (sectionQuery.isError) {
    const err = sectionQuery.error;
    const status = axios.isAxiosError(err) ? err.response?.status : undefined;

    if (status === 404) {
      return (
        <ErrorState
          title="No attendance section assigned"
          message="Please contact management to assign your attendance section."
        />
      );
    }

    return (
      <ErrorState title="Attendance unavailable" message="Please try again." />
    );
  }

  if (studentsQuery.isError) {
    return (
      <ErrorState title="Students unavailable" message="Please try again." />
    );
  }

  if ((studentsQuery.data ?? []).length === 0) {
    return <EmptyState message="No students found for this section." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
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

      {/* Table */}

      {/* Table */}
      <main className="mx-auto mt-4 w-full max-w-3xl px-4">
        <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-md">
          {/* Table header - More compact like screenshot */}
          <div className="grid grid-cols-12 gap-3 border-b border-gray-300 bg-gray-50 px-4 py-3 text-xs font-bold text-gray-700">
            <div className="col-span-2">ROLL NO.</div>
            <div className="col-span-7">STUDENT NAME</div>
            <div className="col-span-3 text-center">STATUS</div>
          </div>

          {/* Rows - More compact spacing */}
          <ul className="divide-y divide-gray-200">
            {students.map((s) => {
              const isPresent = presentById[s.id] !== false;

              return (
                <li key={s.id} className="hover:bg-gray-50/50">
                  <div className="grid grid-cols-12 items-center gap-3 px-4 py-3">
                    <div className="col-span-2">
                      <div className="text-base font-bold text-gray-900">
                        {s.rollNo}
                      </div>
                    </div>

                    <div className="col-span-7 min-w-0">
                      <div className="text-base font-semibold text-gray-900">
                        {s.name}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-gray-500">
                        ID: {s.id}
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleStatus(s.id, "present")}
                          className={`
                            h-8 min-w-[70px] rounded-full px-3 text-xs font-semibold
                            transition-all duration-200
                            ${
                              isPresent
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }
                          `}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(s.id, "absent")}
                          className={`
                            h-8 min-w-[70px] rounded-full px-3 text-xs font-semibold
                            transition-all duration-200
                            ${
                              !isPresent
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }
                          `}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="px-4 py-3 text-center text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
            Showing 6 of {counts.total} Students
          </div>
        </div>
      </main>
      {/* Bottom sticky bar */}
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
            className="h-12 min-w-[180px] rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
