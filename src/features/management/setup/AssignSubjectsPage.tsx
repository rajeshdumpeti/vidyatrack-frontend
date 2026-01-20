import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { logger } from "@/utils/logger";
import {
  useTeachingAssignments,
  useCreateTeachingAssignment,
} from "@/hooks/useTeachingAssignments";
import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { TeachingAssignmentCreatePayload } from "@/types/teachingAssignment.types";

type ClassDto = { id: number; name: string };
type SectionDto = { id: number; name: string; class_id: number };
type SubjectDto = { id: number; name: string };
type TeacherDto = { id: number; name?: string | null; phone?: string | null };

function getFriendlyAssignError(err: unknown): string {
  // Keep it simple and deterministic; no raw stack traces
  // Axios errors usually have response?.status / response?.data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any;
  const status = anyErr?.response?.status;
  const detail = anyErr?.response?.data?.detail;

  if (status === 409 && detail === "assignment_conflict") {
    return "Already assigned to another teacher. Change not allowed.";
  }
  return "Unable to assign teacher. Please try again.";
}

export function AssignSubjectsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [classId, setClassId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);

  // Row UI state (per subject)
  const [selectedTeacherBySubject, setSelectedTeacherBySubject] = useState<
    Record<number, number | "">
  >({});
  const [rowMessage, setRowMessage] = useState<Record<number, string>>({});

  const classesQuery = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await apiClient.get<ClassDto[]>(API_ENDPOINTS.classes.list);
      return res.data;
    },
    retry: 1,
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const res = await apiClient.get<SubjectDto[]>(
        API_ENDPOINTS.subjects.list
      );
      return res.data;
    },
    retry: 1,
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await apiClient.get<TeacherDto[]>(
        API_ENDPOINTS.teachers.list
      );
      return res.data;
    },
    retry: 1,
  });

  const sectionsQuery = useQuery({
    queryKey: ["sections", { classId }],
    queryFn: async () => {
      const res = await apiClient.get<SectionDto[]>(
        API_ENDPOINTS.sections.list,
        {
          params: { class_id: classId },
        }
      );
      return res.data;
    },
    enabled: typeof classId === "number" && classId > 0,
    retry: 1,
  });

  const {
    data: assignments,
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useTeachingAssignments(sectionId);

  const createMutation = useCreateTeachingAssignment();

  const classes = classesQuery.data ?? [];
  const sections = sectionsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];
  const classLabelById = useMemo(() => {
    const map = new Map<number, string>();
    classes.forEach((c) => {
      map.set(c.id, c.name);
    });
    return map;
  }, [classes]);

  const prereqLoading =
    classesQuery.isLoading ||
    subjectsQuery.isLoading ||
    teachersQuery.isLoading;

  const prereqError =
    classesQuery.error || subjectsQuery.error || teachersQuery.error;

  const teacherName = (t: TeacherDto) =>
    t.name?.trim() || t.phone?.trim() || `Teacher ${t.id}`;

  const assignedTeacherIdBySubject = useMemo(() => {
    const map: Record<number, number> = {};
    for (const a of assignments) map[a.subject_id] = a.teacher_id;
    return map;
  }, [assignments]);

  const onChangeClass = (idStr: string) => {
    const next = idStr ? Number(idStr) : null;
    setClassId(next && next > 0 ? next : null);

    // Reset downstream selections
    setSectionId(null);
    setRowMessage({});
    setSelectedTeacherBySubject({});
  };

  const onChangeSection = (idStr: string) => {
    const next = idStr ? Number(idStr) : null;
    setSectionId(next && next > 0 ? next : null);
    setRowMessage({});
    setSelectedTeacherBySubject({});
    logger.info("[assign-subjects] section selected", {
      trace,
      sectionId: next,
    });
  };

  const onSelectTeacherForSubject = (
    subjectId: number,
    teacherIdStr: string
  ) => {
    const next: number | "" = teacherIdStr ? Number(teacherIdStr) : "";
    setSelectedTeacherBySubject((prev) => ({ ...prev, [subjectId]: next }));
  };

  const assignForSubject = async (subjectId: number) => {
    if (!sectionId) return;

    const teacherId = selectedTeacherBySubject[subjectId];
    if (!teacherId || typeof teacherId !== "number") {
      setRowMessage((prev) => ({
        ...prev,
        [subjectId]: "Select a teacher first.",
      }));
      return;
    }

    setRowMessage((prev) => ({ ...prev, [subjectId]: "" }));

    const payload: TeachingAssignmentCreatePayload = {
      section_id: sectionId,
      subject_id: subjectId,
      teacher_id: teacherId,
    };

    createMutation.mutate(payload, {
      onSuccess: (_data, _vars, _ctx) => {
        // Backend may return 201 or 200; Axios still treats both as success
        // We infer "Already assigned" only if chosen teacher matches current assignment
        const current = assignedTeacherIdBySubject[subjectId];
        const msg =
          current === teacherId
            ? "Already assigned."
            : "Assigned successfully.";
        setRowMessage((prev) => ({ ...prev, [subjectId]: msg }));
        logger.info("[assign-subjects] assigned", {
          trace,
          sectionId,
          subjectId,
          teacherId,
        });
      },
      onError: (err) => {
        setRowMessage((prev) => ({
          ...prev,
          [subjectId]: getFriendlyAssignError(err),
        }));
        logger.warn("[assign-subjects] assign failed", {
          trace,
          subjectId,
          err,
        });
      },
    });
  };

  if (prereqLoading) {
    return (
      <div className="px-4 py-6">
        <LoadingState label="Loading setup data..." />
      </div>
    );
  }

  if (prereqError) {
    return (
      <div className="px-4 py-6">
        <ErrorState title="Unable to load setup data" message="Please retry." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xl font-extrabold tracking-tight text-gray-900">
            Assign Subjects
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Pick class + section, then assign a teacher for each subject.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Class
              </label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900"
                value={classId ?? ""}
                onChange={(e) => onChangeClass(e.target.value)}
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (ID: {c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Section
              </label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 disabled:opacity-60"
                value={sectionId ?? ""}
                onChange={(e) => onChangeSection(e.target.value)}
                disabled={!classId || sectionsQuery.isLoading}
              >
                <option value="">
                  {!classId ? "Select class first" : "Select section"}
                </option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {(classLabelById.get(s.class_id) ?? `Class #${s.class_id}`) +
                      " - " +
                      s.name}
                  </option>
                ))}
              </select>
              {sectionsQuery.isError ? (
                <div className="mt-2">
                  <ErrorState
                    title="Unable to load sections"
                    message="Please retry."
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-lg font-extrabold tracking-tight text-gray-900">
            Subjects
          </div>

          {!sectionId ? (
            <div className="mt-3 text-sm text-gray-600">
              Select a class and section to view assignments.
            </div>
          ) : null}

          {sectionId && assignmentsLoading ? (
            <div className="mt-4">
              <LoadingState label="Loading assignments..." />
            </div>
          ) : null}

          {sectionId && assignmentsError ? (
            <div className="mt-4">
              <ErrorState
                title="Unable to load assignments"
                message="Please retry."
              />
            </div>
          ) : null}

          {sectionId && !assignmentsLoading && subjects.length === 0 ? (
            <div className="mt-4">
              <EmptyState message="Add subjects first." />
            </div>
          ) : null}

          {sectionId && !assignmentsLoading && subjects.length > 0 ? (
            <div className="mt-4 space-y-3">
              {subjects.map((subj) => {
                const assignedId = assignedTeacherIdBySubject[subj.id];
                const assignedTeacher = assignedId
                  ? teachers.find((t) => t.id === assignedId)
                  : null;

                const selected = selectedTeacherBySubject[subj.id] ?? "";

                const isRowSubmitting =
                  createMutation.isPending &&
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (createMutation.variables as any)?.subject_id === subj.id;

                return (
                  <div
                    key={subj.id}
                    className="rounded-2xl border border-gray-200 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-gray-900">
                          {subj.name}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          Current:{" "}
                          <span className="font-semibold text-gray-900">
                            {assignedTeacher
                              ? teacherName(assignedTeacher)
                              : "—"}
                          </span>
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <select
                          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 sm:w-64"
                          value={selected}
                          onChange={(e) =>
                            onSelectTeacherForSubject(subj.id, e.target.value)
                          }
                          disabled={isRowSubmitting}
                        >
                          <option value="">Select teacher</option>
                          {teachers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {teacherName(t)}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white disabled:opacity-60 sm:w-auto"
                          onClick={() => assignForSubject(subj.id)}
                          disabled={isRowSubmitting}
                        >
                          {isRowSubmitting ? "Assigning..." : "Assign"}
                        </button>
                      </div>
                    </div>

                    {rowMessage[subj.id] ? (
                      <div className="mt-3 text-sm font-semibold text-gray-700">
                        {rowMessage[subj.id]}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
