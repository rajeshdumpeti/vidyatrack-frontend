import { useState } from "react";
import { X, UserPlus, UserCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listTeachingAssignments, setSubstituteTeacher } from "@/api/teachingAssignments.api";
import { listSubjects } from "@/api/subjects.api";
import type { TeacherDto } from "@/types/teacher.types";

type SubstituteTeacherModalProps = {
  teacher: TeacherDto;
  allTeachers: TeacherDto[];
  schoolId: number;
  onClose: () => void;
};

export function SubstituteTeacherModal({
  teacher,
  allTeachers,
  schoolId,
  onClose,
}: SubstituteTeacherModalProps) {
  const qc = useQueryClient();
  // assignmentId → pending substituteTeacherId (number = selected, null = remove)
  const [pending, setPending] = useState<Record<number, number | null>>({});

  const assignmentsQuery = useQuery({
    queryKey: ["teaching-assignments", schoolId, { teacherId: teacher.id }],
    queryFn: () => listTeachingAssignments(schoolId, { teacherId: teacher.id }),
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects", schoolId],
    queryFn: () => listSubjects(schoolId),
  });

  const mutation = useMutation({
    mutationFn: ({
      assignmentId,
      substituteTeacherId,
    }: {
      assignmentId: number;
      substituteTeacherId: number | null;
    }) => setSubstituteTeacher(assignmentId, substituteTeacherId, schoolId),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["teaching-assignments", schoolId, { teacherId: teacher.id }],
      });
    },
  });

  const subjectMap = new Map(
    (subjectsQuery.data ?? []).map((s) => [s.id, s.name]),
  );

  const activeTeachers = allTeachers.filter(
    (t) => t.status === "ACTIVE" && t.id !== teacher.id,
  );

  const assignments = assignmentsQuery.data ?? [];
  const isLoading = assignmentsQuery.isLoading || subjectsQuery.isLoading;

  const handleSave = (assignmentId: number) => {
    const substituteTeacherId = pending[assignmentId] ?? null;
    mutation.mutate({ assignmentId, substituteTeacherId });
    setPending((prev) => {
      const next = { ...prev };
      delete next[assignmentId];
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900">Assign Substitute</h2>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              {teacher.name ?? `Teacher #${teacher.id}`} is On Leave — assign a cover teacher per subject.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {isLoading ? (
            <p className="text-center text-sm text-gray-500">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No subject assignments found for this teacher.
            </p>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const subjectName =
                  subjectMap.get(assignment.subject_id) ?? `Subject #${assignment.subject_id}`;
                const currentSubId = assignment.substitute_teacher_id ?? null;
                const pendingSubId =
                  assignment.id in pending ? pending[assignment.id] : currentSubId;
                const isDirty =
                  assignment.id in pending &&
                  pending[assignment.id] !== currentSubId;
                const isSaving =
                  mutation.isPending &&
                  mutation.variables?.assignmentId === assignment.id;

                return (
                  <div
                    key={assignment.id}
                    className="rounded-xl border border-gray-200 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {subjectName}
                      </p>
                      {currentSubId ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <UserCheck className="h-3 w-3" />
                          Sub assigned
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <select
                        className="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                        value={pendingSubId ?? ""}
                        disabled={isSaving}
                        onChange={(e) =>
                          setPending((prev) => ({
                            ...prev,
                            [assignment.id]: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                      >
                        <option value="">No substitute</option>
                        {activeTeachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name ?? `Teacher #${t.id}`}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleSave(assignment.id)}
                        disabled={!isDirty || isSaving}
                        className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
