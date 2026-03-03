import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { LoadingState } from "@/components/feedback/LoadingState";
import { Pagination } from "@/components/ui/Pagination";

import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { useStudentsBySection } from "@/hooks/useStudentsBySection";
import { useAttendanceBySectionDate } from "@/hooks/useAttendanceBySectionDate";
import { useAttendanceSubmit } from "@/hooks/useAttendanceSubmit";
import { useCreateAttendanceRecord } from "@/hooks/useCreateAttendanceRecord";
import { useUpdateAttendance } from "@/hooks/useUpdateAttendance";
import { usePagination } from "@/hooks/usePagination";
import { AttendanceSubmitModal } from "@/features/teachers/attendance/AttendanceSubmitModal";
import { formatIsoDate } from "@/utils/date";
import type { AttendanceStatusDto } from "@/types/attendance-submit.types";
import type { AttendanceRecordDto } from "@/types/attendance.types";
import { useAuthStore } from "@/store/auth.store";

type StudentUi = {
  id: string;
  rollNo: string;
  name: string;
  initials: string;
};

function normalizeStatus(status: AttendanceStatusDto): "PRESENT" | "ABSENT" {
  return status === "ABSENT" || status === "absent" ? "ABSENT" : "PRESENT";
}

export function MarkAttendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const schoolId = useAuthStore((s) => s.schoolId);
  const setSchoolId = useAuthStore((s) => s.setSchoolId);

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
  }, [submitSuccess, navigate]);

  const sectionLabel = location.state?.section_id
    ? `${location.state.class_name || "Class"} - ${location.state.section_name || location.state.subject_name}`
    : section.data
      ? `${section.data.class_name} - ${section.data.section_name}`
      : "Loading Section...";

  const students: StudentUi[] = useMemo(() => {
    const list = studentsQuery.data ?? [];
    return list.map((s, idx) => ({
      id: String(s.id),
      rollNo:
        s.roll_no != null
          ? String(s.roll_no).padStart(2, "0")
          : String(idx + 1).padStart(2, "0"),
      name: s.name,
      initials: s.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    }));
  }, [studentsQuery.data]);
  const studentsPagination = usePagination(students, {
    initialPageSize: 20,
    resetDeps: [sectionId, selectedDateIso],
  });

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
    if (isReadOnly || !sectionId || !schoolId) return;

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
          return;
        }
      }
    };

    if (existing) {
      updateAttendance.mutate(
        {
          attendance_id: existing.attendance_id,
          status: nextStatus,
          student_id: studentIdNum,
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
    return { total, present, absent: total - present };
  }, [students, presentById]);

  const onSubmit = () => {
    if (!sectionId || isReadOnly) return;
    setSubmitSuccess(false);
    resetSubmitError?.();
    const studentsForApi = students.map((s) => ({
      studentId: Number(s.id),
      status:
        presentById[s.id] !== false
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

  if (section.isLoading || studentsQuery.isLoading || attendanceQuery.isLoading)
    return <LoadingState label="Loading students..." />;

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-10">
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {/* Responsive Header */}
        <div className="flex items-center justify-between mb-2 md:mb-6">
          <button
            onClick={() => navigate("/teacher")}
            className="text-blue-600 font-bold text-sm flex items-center gap-1"
          >
            <span className="text-lg">←</span> BACK
          </button>
          <div className="text-sm font-bold text-gray-800 tracking-tight md:tracking-widest md:uppercase md:text-gray-400">
            Attendance Entry
          </div>
          <div className="hidden md:block w-16" />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 md:mb-8">
          Mark Attendance
        </h1>

        {/* Responsive Context Bar */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-8 text-[13px] md:text-sm font-bold text-gray-600">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg ">
            <span className="text-grey-600">■</span>{" "}
            <span className="hidden md:inline">Class</span> {className}
          </div>
          <div className=" md:flex items-center gap-2 px-2 py-1.5 rounded-lg ">
            <span className="text-grey-600">✎</span> {subjectName}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg ">
            <span className="text-grey-600 md:text-grey-600">⏺</span>{" "}
            <span className="hidden md:inline">Section</span> {sectionName}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="bg-white rounded-[24px] md:rounded-3xl border border-gray-100 md:border-gray-200 shadow-sm overflow-hidden mb-10">
          <div className="grid grid-cols-12 bg-gray-50/50 border-b border-gray-100 px-2 md:px-8 py-4 md:py-5 text-[10px] md:text-[11px] font-black md:font-bold uppercase tracking-widest text-gray-400">
            <div className="col-span-2">Roll No.</div>
            <div className="col-span-6 md:col-span-6">Student Name</div>
            <div className="col-span-4 text-center">Status Selection</div>
          </div>

          <div className="divide-y divide-gray-50 md:divide-gray-100">
            {studentsPagination.pagedItems.map((s) => {
              const isPresent = presentById[s.id] !== false;
              return (
                <div
                  key={s.id}
                  className={`grid grid-cols-12 items-center px-2 md:px-8 py-4 md:py-5 transition-colors ${
                    isPresent ? "bg-white" : "bg-[#FFF5F5] md:bg-red-50"
                  }`}
                >
                  <div className="col-span-2 text-sm font-bold text-gray-400">
                    {s.rollNo}
                  </div>
                  <div className="col-span-6 md:col-span-6 flex items-center gap-3 md:gap-4 truncate">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-black md:font-bold shrink-0 transition-colors ${
                        isPresent
                          ? "bg-blue-50 text-blue-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {s.initials}
                    </div>
                    <div className="truncate">
                      <div className="text-[14px] md:text-sm font-bold text-gray-900 truncate">
                        {s.name}
                      </div>
                      <div className="text-[10px] font-bold md:font-medium text-gray-400 uppercase tracking-tighter">
                        Standard Plan
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 flex justify-center">
                    <div className="inline-flex p-1 rounded-xl items-center">
                      <button
                        type="button"
                        onClick={() => toggleStatus(s.id)}
                        disabled={isReadOnly}
                        className={`
                        h-11 min-w-[120px] rounded-xl px-4 text-sm font-semibold
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
                </div>
              );
            })}
          </div>
          <Pagination
            page={studentsPagination.page}
            pageSize={studentsPagination.pageSize}
            totalItems={studentsPagination.totalItems}
            totalPages={studentsPagination.totalPages}
            from={studentsPagination.from}
            to={studentsPagination.to}
            onPageChange={studentsPagination.setPage}
            onPageSizeChange={studentsPagination.setPageSize}
          />
        </div>

        {/* Responsive Summary Footer */}
        <div className="fixed md:relative bottom-0 left-0 right-0 p-4 md:p-0 bg-gray-50/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none z-10 md:z-0">
          <div className="max-w-md md:max-w-none mx-auto bg-[#F4F7FF] md:bg-[#EEF2FF] rounded-[32px] md:rounded-3xl p-6 md:p-8 border border-white md:border-blue-100 shadow-2xl md:shadow-xl text-center">
            <div className="flex items-center justify-center gap-8 md:gap-12 mb-6">
              <div className="text-center">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Present
                </div>
                <div className="text-3xl md:text-4xl font-black text-[#12B76A]">
                  {String(counts.present).padStart(2, "0")}
                </div>
              </div>
              <div className="h-10 w-[1px] bg-blue-100 md:bg-blue-200" />
              <div className="text-center">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Absent
                </div>
                <div className="text-3xl md:text-4xl font-black text-[#F04438]">
                  {String(counts.absent).padStart(2, "0")}
                </div>
              </div>
            </div>

            <button
              onClick={onSubmit}
              disabled={isSubmitting || isReadOnly}
              className="w-full bg-[#2D54E8] hover:bg-[#2546C1] active:scale-95 text-white rounded-2xl py-4 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Syncing..." : "Submit Attendance"}{" "}
              <span className="text-lg">➤</span>
            </button>
            <p className="mt-4 text-[9px] md:text-[10px] font-bold md:font-medium text-gray-400 uppercase tracking-widest">
              Data will be instantly synced with the central management portal.
            </p>
          </div>
        </div>

        <AttendanceSubmitModal
          isSubmitting={isSubmitting}
          submitSuccess={submitSuccess}
          submitError={Boolean(submitError)}
          sectionLabel={sectionLabel}
          redirectCountdown={redirectCountdown}
          onSubmit={onSubmit}
          onClose={() => resetSubmitError?.()}
          onReturnHome={() =>
            navigate("/teacher", {
              replace: true,
              state: { toast: `Attendance submitted for ${sectionLabel}` },
            })
          }
        />
      </div>
    </div>
  );
}
