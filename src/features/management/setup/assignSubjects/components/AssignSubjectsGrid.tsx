import { ShieldCheck, UserCheck } from "lucide-react";

import type {
  AssignSubjectsSectionDto,
  AssignSubjectsSubjectDto,
  AssignSubjectsTeacherDto,
  AssignSubjectsRowMessage,
} from "../types/assignSubjects.types";

type AssignSubjectsGridProps = {
  sectionId: number | null;
  sections: AssignSubjectsSectionDto[];
  subjects: AssignSubjectsSubjectDto[];
  teachers: AssignSubjectsTeacherDto[];
  selectedTeacherBySubject: Record<number, number | "">;
  assignedTeacherIdBySubject: Record<number, number>;
  rowMessage: AssignSubjectsRowMessage;
  recentlyCompletedSubjectId: number | null;
  bulkSaving: boolean;
  bulkMessage: string | null;
  pendingAssignmentsCount: number;
  createMutationPending: boolean;
  createMutationSubjectId?: number;
  teacherName: (teacher: AssignSubjectsTeacherDto) => string;
  onTeacherChange: (subjectId: number, teacherId: number | "") => void;
  onAssign: (subjectId: number) => void;
  onSaveAll: () => void;
};

export function AssignSubjectsGrid({
  sectionId,
  sections,
  subjects,
  teachers,
  selectedTeacherBySubject,
  assignedTeacherIdBySubject,
  rowMessage,
  recentlyCompletedSubjectId,
  bulkSaving,
  bulkMessage,
  pendingAssignmentsCount,
  createMutationPending,
  createMutationSubjectId,
  teacherName,
  onTeacherChange,
  onAssign,
  onSaveAll,
}: AssignSubjectsGridProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-8">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Subject Assignment Grid</h3>
        <div className="flex items-center gap-2">
          {sectionId ? (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {sections.find((section) => section.id === sectionId)?.name}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onSaveAll}
            disabled={!sectionId || pendingAssignmentsCount === 0 || bulkSaving}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {bulkSaving ? "Saving..." : `Save All (${pendingAssignmentsCount})`}
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
            const assignedTeacher = teachers.find((teacher) => teacher.id === assignedId);
            const message = rowMessage[subject.id];
            const isRowSubmitting =
              createMutationPending && createMutationSubjectId === subject.id;
            const pendingTeacherId = selectedTeacherBySubject[subject.id];
            const isPendingChange =
              typeof pendingTeacherId === "number" && pendingTeacherId !== assignedId;
            const isAssigned = Boolean(assignedTeacher);
            const isRecentlyCompleted = recentlyCompletedSubjectId === subject.id;

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
                      onTeacherChange(
                        subject.id,
                        event.target.value ? Number(event.target.value) : "",
                      )
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
                    onClick={() => onAssign(subject.id)}
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
  );
}
