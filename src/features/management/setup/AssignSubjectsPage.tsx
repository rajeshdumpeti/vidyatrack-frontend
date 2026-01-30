import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineClipboardCheck,
  HiOutlineInformationCircle,
} from "react-icons/hi";

import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import {
  useTeachingAssignments,
  useCreateTeachingAssignment,
} from "@/hooks/useTeachingAssignments";
import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { logger } from "@/utils/logger";
import type { TeachingAssignmentCreatePayload } from "@/types/teachingAssignment.types";
import { useAuthStore } from "@/store/auth.store";

// Types
type ClassDto = { id: number; name: string };
type SectionDto = { id: number; name: string; class_id: number };
type SubjectDto = { id: number; name: string };
type TeacherDto = { id: number; name?: string | null; phone?: string | null };

function getFriendlyAssignError(err: unknown): string {
  const anyErr = err as any;
  const status = anyErr?.response?.status;
  const detail = anyErr?.response?.data?.detail;

  if (status === 409 && detail === "assignment_conflict") {
    return "Subject is already assigned to a different teacher.";
  }
  return "Connection error. Please try again.";
}

export function AssignSubjectsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const { schoolId } = useAuthStore();

  const [classId, setClassId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);

  // Row UI state
  const [selectedTeacherBySubject, setSelectedTeacherBySubject] = useState<
    Record<number, number | "">
  >({});
  const [rowMessage, setRowMessage] = useState<
    Record<number, { text: string; type: "success" | "error" }>
  >({});

  // 1. Data Fetching with School Isolation
  const classesQuery = useQuery({
    queryKey: ["classes", schoolId],
    queryFn: async () => {
      const res = await apiClient.get<ClassDto[]>(API_ENDPOINTS.classes.list, {
        params: { school_id: schoolId },
      });
      return res.data;
    },
    enabled: !!schoolId,
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects", schoolId],
    queryFn: async () => {
      const res = await apiClient.get<SubjectDto[]>(
        API_ENDPOINTS.subjects.list,
        { params: { school_id: schoolId } },
      );
      return res.data;
    },
    enabled: !!schoolId,
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers", schoolId],
    queryFn: async () => {
      const res = await apiClient.get<TeacherDto[]>(
        API_ENDPOINTS.teachers.list,
        { params: { school_id: schoolId } },
      );
      return res.data;
    },
    enabled: !!schoolId,
  });

  const sectionsQuery = useQuery({
    queryKey: ["sections", schoolId, { classId }],
    queryFn: async () => {
      const res = await apiClient.get<SectionDto[]>(
        API_ENDPOINTS.sections.list,
        { params: { school_id: schoolId, class_id: classId } },
      );
      return res.data;
    },
    enabled: !!schoolId && !!classId,
  });

  const { data: assignments, isLoading: assignmentsLoading } =
    useTeachingAssignments(sectionId);
  const createMutation = useCreateTeachingAssignment();

  // 2. Computed Logic
  const classes = classesQuery.data ?? [];
  const sections = sectionsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];

  const assignedTeacherIdBySubject = useMemo(() => {
    const map: Record<number, number> = {};
    assignments.forEach((a) => {
      map[a.subject_id] = a.teacher_id;
    });
    return map;
  }, [assignments]);

  const teacherName = (t: TeacherDto) =>
    t.name?.trim() || t.phone?.trim() || `ID: ${t.id}`;

  // 3. Handlers
  const assignForSubject = (subjectId: number) => {
    if (!sectionId) return;
    const teacherId = selectedTeacherBySubject[subjectId];

    if (!teacherId || typeof teacherId !== "number") {
      setRowMessage((p) => ({
        ...p,
        [subjectId]: { text: "Select a teacher", type: "error" },
      }));
      return;
    }

    createMutation.mutate(
      { section_id: sectionId, subject_id: subjectId, teacher_id: teacherId },
      {
        onSuccess: () => {
          setRowMessage((p) => ({
            ...p,
            [subjectId]: { text: "Assigned successfully", type: "success" },
          }));
          logger.info("[assign] success", { trace, subjectId, teacherId });
        },
        onError: (err) => {
          setRowMessage((p) => ({
            ...p,
            [subjectId]: { text: getFriendlyAssignError(err), type: "error" },
          }));
        },
      },
    );
  };

  if (classesQuery.isLoading || subjectsQuery.isLoading) {
    return (
      <div className="p-20">
        <LoadingState label="Preparing assignment matrix..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <HiOutlineUserGroup size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e293b]">
            Teacher Assignments
          </h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">
            Allocate teachers to subjects for specific sections.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Sidebar: Select Context */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                Target Class
              </label>
              <select
                className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                value={classId ?? ""}
                onChange={(e) => {
                  setClassId(Number(e.target.value));
                  setSectionId(null);
                }}
              >
                <option value="">Choose Class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                Target Section
              </label>
              <select
                className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all disabled:opacity-50"
                value={sectionId ?? ""}
                onChange={(e) => setSectionId(Number(e.target.value))}
                disabled={!classId}
              >
                <option value="">
                  {sectionsQuery.isLoading ? "Loading..." : "Choose Section..."}
                </option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {!sectionId && (
              <div className="flex items-start gap-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <HiOutlineInformationCircle
                  className="text-blue-500 mt-0.5 shrink-0"
                  size={18}
                />
                <p className="text-[11px] text-blue-600 font-medium leading-relaxed">
                  Select both class and section to view current subject
                  assignments.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Assignment List */}
        <div className="col-span-12 lg:col-span-8">
          {!sectionId ? (
            <div className="bg-white/50 rounded-[40px] border-2 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center">
              <HiOutlineAcademicCap className="text-slate-200 size-16 mb-4" />
              <p className="text-slate-400 font-semibold italic">
                Awaiting section selection...
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Subject Load Matrix
                </span>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-extrabold shadow-sm shadow-blue-100 uppercase tracking-tighter">
                  Active Section:{" "}
                  {sections.find((s) => s.id === sectionId)?.name}
                </span>
              </div>

              <div className="p-6 space-y-3">
                {subjects.length === 0 ? (
                  <p className="p-10 text-center text-slate-400 text-sm font-medium">
                    No subjects found for this school.
                  </p>
                ) : (
                  subjects.map((subj) => {
                    const assignedId = assignedTeacherIdBySubject[subj.id];
                    const assignedTeacher = teachers.find(
                      (t) => t.id === assignedId,
                    );
                    const isRowSubmitting =
                      createMutation.isPending &&
                      (createMutation.variables as any)?.subject_id === subj.id;
                    const message = rowMessage[subj.id];

                    return (
                      <div
                        key={subj.id}
                        className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-bold text-[10px] border border-slate-100">
                              {subj.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-700 text-sm">
                                {subj.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {assignedTeacher ? (
                                  <>
                                    <HiOutlineClipboardCheck className="text-green-500" />
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                      Assigned: {teacherName(assignedTeacher)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-tight">
                                    Unassigned
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <select
                              className="h-11 px-4 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none w-full md:w-48"
                              value={selectedTeacherBySubject[subj.id] ?? ""}
                              onChange={(e) =>
                                setSelectedTeacherBySubject((p) => ({
                                  ...p,
                                  [subj.id]: Number(e.target.value),
                                }))
                              }
                            >
                              <option value="">Select Teacher...</option>
                              {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {teacherName(t)}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => assignForSubject(subj.id)}
                              disabled={isRowSubmitting}
                              className="h-11 px-6 bg-[#0f172a] hover:bg-black text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-slate-100"
                            >
                              {isRowSubmitting ? "..." : "Assign"}
                            </button>
                          </div>
                        </div>
                        {message && (
                          <div
                            className={`mt-3 text-[10px] font-bold px-3 py-1.5 rounded-lg inline-block ${message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                          >
                            {message.text}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
