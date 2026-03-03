import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Plus, ShieldCheck, UserCheck } from "lucide-react";
import { LoadingState } from "@/components/feedback/LoadingState";
import {
  useTeachingAssignments,
  useCreateTeachingAssignment,
} from "@/hooks/useTeachingAssignments";
import { createSection } from "@/api/sections.api";
import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { createTeachingAssignment } from "@/api/teachingAssignments.api";
import { logger } from "@/utils/logger";
import { useAuthStore } from "@/store/auth.store";
import { AcademicSetupShell } from "./AcademicSetupShell";

type ClassDto = { id: number; name: string };
type SectionDto = { id: number; name: string; class_id: number };
type SubjectDto = { id: number; name: string };
type TeacherDto = { id: number; name?: string | null; phone?: string | null };

function getFriendlyAssignError(err: unknown): string {
  const maybeError = err as {
    response?: { status?: number; data?: { detail?: unknown } };
  };
  const status = maybeError?.response?.status;
  const detail = maybeError?.response?.data?.detail;
  if (status === 409 && detail === "assignment_conflict") {
    return "Subject already assigned to another teacher.";
  }
  return "Unable to assign right now. Retry once.";
}

export function AssignSubjectsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const { schoolId } = useAuthStore();
  const queryClient = useQueryClient();

  const [classId, setClassId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [selectedTeacherBySubject, setSelectedTeacherBySubject] = useState<
    Record<number, number | "">
  >({});
  const [rowMessage, setRowMessage] = useState<
    Record<number, { text: string; type: "success" | "error" }>
  >({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [recentlyCompletedSubjectId, setRecentlyCompletedSubjectId] = useState<
    number | null
  >(null);

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

  const createDefaultSectionMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId || !classId) throw new Error("missing_context");
      return createSection({
        school_id: schoolId,
        class_id: classId,
        name: "General",
      });
    },
    onSuccess: async (section) => {
      await queryClient.invalidateQueries({
        queryKey: ["sections", schoolId, { classId }],
      });
      setSectionId(section.id);
      logger.info("[assign] default_section_created", {
        trace,
        schoolId,
        classId,
        sectionId: section.id,
      });
    },
  });

  const { data: assignments } = useTeachingAssignments(sectionId);
  const createMutation = useCreateTeachingAssignment();

  const classes = useMemo(() => classesQuery.data ?? [], [classesQuery.data]);
  const sections = useMemo(
    () => sectionsQuery.data ?? [],
    [sectionsQuery.data],
  );
  const subjects = useMemo(
    () => subjectsQuery.data ?? [],
    [subjectsQuery.data],
  );
  const teachers = useMemo(
    () => teachersQuery.data ?? [],
    [teachersQuery.data],
  );
  const selectedClass = classes.find((c) => c.id === classId);
  const noSectionsForClass =
    !!classId && !sectionsQuery.isLoading && sections.length === 0;

  const assignedTeacherIdBySubject = useMemo(() => {
    const map: Record<number, number> = {};
    assignments.forEach((assignment) => {
      map[assignment.subject_id] = assignment.teacher_id;
    });
    return map;
  }, [assignments]);

  const teacherName = (teacher: TeacherDto) =>
    teacher.name?.trim() || teacher.phone?.trim() || `ID: ${teacher.id}`;

  const assignForSubject = (subjectId: number) => {
    if (!sectionId) return;
    const teacherId = selectedTeacherBySubject[subjectId];

    if (!teacherId || typeof teacherId !== "number") {
      setRowMessage((prev) => ({
        ...prev,
        [subjectId]: { text: "Select teacher first.", type: "error" },
      }));
      return;
    }

    setBulkMessage(null);
    createMutation.mutate(
      { section_id: sectionId, subject_id: subjectId, teacher_id: teacherId },
      {
        onSuccess: () => {
          setRowMessage((prev) => ({
            ...prev,
            [subjectId]: { text: "Assigned successfully.", type: "success" },
          }));
          setRecentlyCompletedSubjectId(subjectId);
          logger.info("[assign] success", { trace, subjectId, teacherId });
        },
        onError: (err) => {
          setRowMessage((prev) => ({
            ...prev,
            [subjectId]: { text: getFriendlyAssignError(err), type: "error" },
          }));
        },
      },
    );
  };

  const pendingAssignments = useMemo(
    () =>
      subjects
        .map((subject) => {
          const teacherId = selectedTeacherBySubject[subject.id];
          if (!teacherId || typeof teacherId !== "number") return null;
          if (assignedTeacherIdBySubject[subject.id] === teacherId) return null;
          return {
            subjectId: subject.id,
            teacherId,
          };
        })
        .filter((row): row is { subjectId: number; teacherId: number } =>
          Boolean(row),
        ),
    [assignedTeacherIdBySubject, selectedTeacherBySubject, subjects],
  );

  useEffect(() => {
    if (!recentlyCompletedSubjectId) return;
    const t = window.setTimeout(() => setRecentlyCompletedSubjectId(null), 900);
    return () => window.clearTimeout(t);
  }, [recentlyCompletedSubjectId]);

  const onSaveAll = async () => {
    if (!schoolId || !sectionId || pendingAssignments.length === 0) return;
    const shouldProceed = window.confirm(
      `Apply ${pendingAssignments.length} subject assignments now?`,
    );
    if (!shouldProceed) return;

    setBulkSaving(true);
    setBulkMessage(null);

    const results = await Promise.allSettled(
      pendingAssignments.map((row) =>
        createTeachingAssignment({
          school_id: schoolId,
          section_id: sectionId,
          subject_id: row.subjectId,
          teacher_id: row.teacherId,
        }),
      ),
    );

    let successCount = 0;
    let failCount = 0;
    results.forEach((result, idx) => {
      const subjectId = pendingAssignments[idx].subjectId;
      if (result.status === "fulfilled") {
        successCount += 1;
        setRowMessage((prev) => ({
          ...prev,
          [subjectId]: { text: "Assigned successfully.", type: "success" },
        }));
        setRecentlyCompletedSubjectId(subjectId);
      } else {
        failCount += 1;
        setRowMessage((prev) => ({
          ...prev,
          [subjectId]: { text: getFriendlyAssignError(result.reason), type: "error" },
        }));
      }
    });

    await queryClient.invalidateQueries({
      queryKey: ["teaching-assignments", schoolId, { sectionId }],
    });

    setBulkMessage(
      failCount === 0
        ? `${successCount} assignments saved successfully.`
        : `${successCount} saved, ${failCount} failed.`,
    );
    setBulkSaving(false);
  };

  if (classesQuery.isLoading || subjectsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <LoadingState label="Loading assignment controls..." />
      </div>
    );
  }

  return (
    <AcademicSetupShell
      title="Assignment Management"
      description="Map each subject to a responsible teacher with section-level control."
      icon={Link2}
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-4">
          <h3 className="text-sm font-bold text-slate-900">Assignment Context</h3>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Class
            </label>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={classId ?? ""}
              onChange={(event) => {
                const next = event.target.value ? Number(event.target.value) : null;
                setClassId(next);
                setSectionId(null);
                setSelectedTeacherBySubject({});
                setRowMessage({});
              }}
            >
              <option value="">Select class</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Section
            </label>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              value={sectionId ?? ""}
              onChange={(event) => {
                setSectionId(event.target.value ? Number(event.target.value) : null);
                setSelectedTeacherBySubject({});
                setRowMessage({});
              }}
              disabled={!classId || noSectionsForClass}
            >
              <option value="">
                {sectionsQuery.isLoading ? "Loading..." : "Select section"}
              </option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          {noSectionsForClass ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800">
                No sections found for {selectedClass?.name ?? "selected class"}.
              </p>
              <button
                type="button"
                onClick={() => createDefaultSectionMutation.mutate()}
                disabled={createDefaultSectionMutation.isPending}
                className="mt-2 inline-flex h-9 items-center gap-1 rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                {createDefaultSectionMutation.isPending
                  ? "Creating..."
                  : 'Create "General"'}
              </button>
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">Subject Assignment Grid</h3>
            <div className="flex items-center gap-2">
              {sectionId ? (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {sections.find((s) => s.id === sectionId)?.name}
                </span>
              ) : null}
              <button
                type="button"
                onClick={onSaveAll}
                disabled={!sectionId || pendingAssignments.length === 0 || bulkSaving}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {bulkSaving
                  ? "Saving..."
                  : `Save All (${pendingAssignments.length})`}
              </button>
            </div>
          </div>
          {!sectionId ? (
            <div className="m-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <UserCheck className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Select class and section to start mapping teachers.
              </p>
            </div>
          ) : subjects.length === 0 ? (
            <p className="m-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-10 text-center text-sm font-medium text-slate-500">
              No subjects available.
            </p>
          ) : (
            <div className="space-y-2 p-4">
              {bulkMessage ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  {bulkMessage}
                </div>
              ) : null}
              {subjects.map((subject) => {
                const assignedId = assignedTeacherIdBySubject[subject.id];
                const assignedTeacher = teachers.find((t) => t.id === assignedId);
                const message = rowMessage[subject.id];
                const isRowSubmitting =
                  createMutation.isPending &&
                  createMutation.variables?.subject_id === subject.id;
                const pendingTeacherId = selectedTeacherBySubject[subject.id];
                const isPendingChange =
                  typeof pendingTeacherId === "number" &&
                  pendingTeacherId !== assignedId;
                const isAssigned = Boolean(assignedTeacher);
                const isRecentlyCompleted =
                  recentlyCompletedSubjectId === subject.id;

                return (
                  <div
                    key={subject.id}
                    className={[
                      "rounded-xl border px-3 py-3 transition-colors",
                      isRecentlyCompleted
                        ? "border-blue-300 bg-blue-50/80"
                        : isAssigned
                          ? "border-blue-200 bg-blue-50/40"
                          : "border-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_220px_120px] lg:items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {subject.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <p className="text-xs font-medium text-slate-500">
                            {assignedTeacher
                              ? `Assigned: ${teacherName(assignedTeacher)}`
                              : "Not assigned"}
                          </p>
                          {isAssigned ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              Completed
                            </span>
                          ) : null}
                          {isPendingChange ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                              Pending Save
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <select
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={selectedTeacherBySubject[subject.id] ?? ""}
                        onChange={(event) =>
                          setSelectedTeacherBySubject((prev) => ({
                            ...prev,
                            [subject.id]: event.target.value
                              ? Number(event.target.value)
                              : "",
                          }))
                        }
                      >
                        <option value="">Select teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacherName(teacher)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => assignForSubject(subject.id)}
                        disabled={isRowSubmitting}
                        className="inline-flex h-10 items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {isRowSubmitting ? "Saving..." : "Assign"}
                      </button>
                    </div>
                    {message ? (
                      <p
                        className={[
                          "mt-2 text-xs font-semibold",
                          message.type === "success"
                            ? "text-emerald-700"
                            : "text-red-700",
                        ].join(" ")}
                      >
                        {message.text}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </section>
    </AcademicSetupShell>
  );
}
