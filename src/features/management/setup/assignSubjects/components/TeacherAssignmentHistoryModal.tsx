import { X, Clock, ArrowRight, UserCheck } from "lucide-react";

import { useTeacherAssignmentHistory } from "@/hooks/useTeachingAssignments";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { AssignSubjectsTeacherDto, HistoryTarget } from "../types/assignSubjects.types";

type TeacherAssignmentHistoryModalProps = {
  target: HistoryTarget;
  teachers: AssignSubjectsTeacherDto[];
  teacherName: (teacher: AssignSubjectsTeacherDto) => string;
  onClose: () => void;
};

function resolveTeacherName(
  teachers: AssignSubjectsTeacherDto[],
  teacherName: (t: AssignSubjectsTeacherDto) => string,
  id: number | null,
): string {
  if (id === null) return "—";
  const found = teachers.find((t) => t.id === id);
  return found ? teacherName(found) : `Teacher #${id}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TeacherAssignmentHistoryModal({
  target,
  teachers,
  teacherName,
  onClose,
}: TeacherAssignmentHistoryModalProps) {
  const { data, isLoading, isError } = useTeacherAssignmentHistory(
    target.sectionId,
    target.subjectId,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Assignment History — {target.subjectName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-96 overflow-y-auto p-5">
          {isLoading ? (
            <LoadingState label="Loading history..." />
          ) : isError ? (
            <ErrorState title="Failed to load" message="Please try again." />
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <UserCheck className="h-6 w-6 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">
                No history yet for this subject.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {data.map((entry, index) => (
                <li
                  key={entry.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[11px] font-bold",
                        entry.action === "ASSIGNED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700",
                      ].join(" ")}
                    >
                      {entry.action === "ASSIGNED" ? "First Assigned" : "Reassigned"}
                    </span>
                    {index === 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                    {entry.action === "REASSIGNED" ? (
                      <>
                        <span className="font-medium text-slate-500 line-through">
                          {resolveTeacherName(teachers, teacherName, entry.previous_teacher_id)}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="font-semibold text-slate-900">
                          {resolveTeacherName(teachers, teacherName, entry.new_teacher_id)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-slate-900">
                        {resolveTeacherName(teachers, teacherName, entry.new_teacher_id)}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(entry.changed_at)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
