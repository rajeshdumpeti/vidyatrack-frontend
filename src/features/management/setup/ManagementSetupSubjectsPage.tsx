import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpenCheck, Trash2 } from "lucide-react";

import { getAcademicSetup } from "@/api/academicSetup.api";
import {
  createManagementSubject,
  deleteManagementSubject,
  listManagementSubjects,
} from "@/api/managementSetup.api";
import { useAuthStore } from "@/store/auth.store";

import { AcademicSetupShell } from "./AcademicSetupShell";

const SUBJECT_TYPES = ["core", "elective", "language", "activity"] as const;

export function ManagementSetupSubjectsPage() {
  const schoolId = useAuthStore((state) => state.schoolId);
  const queryClient = useQueryClient();
  const academicQuery = useQuery({
    queryKey: ["management-subject-classes", schoolId],
    queryFn: () => getAcademicSetup(schoolId!),
    enabled: Boolean(schoolId),
  });

  const initialClassId = academicQuery.data?.classes?.[0]?.id ?? null;
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const effectiveClassId = selectedClassId ?? initialClassId;

  const subjectsQuery = useQuery({
    queryKey: ["management-class-subjects", schoolId, effectiveClassId],
    queryFn: () => listManagementSubjects(schoolId!, effectiveClassId!),
    enabled: Boolean(schoolId && effectiveClassId),
  });

  const [subjectId, setSubjectId] = useState<number | "">("");
  const [newName, setNewName] = useState("");
  const [subjectType, setSubjectType] = useState<(typeof SUBJECT_TYPES)[number]>("core");
  const [maxMarks, setMaxMarks] = useState("100");
  const [passingMarks, setPassingMarks] = useState("35");

  const createMutation = useMutation({
    mutationFn: () =>
      createManagementSubject(schoolId!, {
        class_id: effectiveClassId!,
        ...(subjectId ? { subject_id: subjectId } : { name: newName.trim() }),
        subject_type: subjectType,
        max_marks: Number(maxMarks || 100),
        passing_marks: Number(passingMarks || 35),
      }),
    onSuccess: async () => {
      setSubjectId("");
      setNewName("");
      setSubjectType("core");
      setMaxMarks("100");
      setPassingMarks("35");
      await queryClient.invalidateQueries({
        queryKey: ["management-class-subjects", schoolId, effectiveClassId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["management-setup-status", schoolId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["academic-setup", schoolId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (classSubjectId: number) =>
      deleteManagementSubject(schoolId!, classSubjectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["management-class-subjects", schoolId, effectiveClassId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["management-setup-status", schoolId],
      });
    },
  });

  const classes = academicQuery.data?.classes ?? [];
  const className = useMemo(
    () =>
      classes.find((item) => item.id === effectiveClassId)?.name ??
      subjectsQuery.data?.class_name ??
      "Grade",
    [classes, effectiveClassId, subjectsQuery.data?.class_name],
  );

  return (
    <AcademicSetupShell
      title="Grade Subjects"
      description="Link the subject catalog to each grade with marks rules."
      icon={BookOpenCheck}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {classes.map((classRow) => (
            <button
              key={classRow.id}
              type="button"
              onClick={() => setSelectedClassId(classRow.id)}
              className={[
                "rounded-xl border px-3 py-2 text-sm font-bold",
                effectiveClassId === classRow.id
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700",
              ].join(" ")}
            >
              {classRow.name}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Add subject to {className}</h2>
          <div className="mt-4 space-y-3">
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Create new subject</option>
              {(subjectsQuery.data?.subject_catalog ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {!subjectId ? (
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Subject name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            ) : null}
            <select
              value={subjectType}
              onChange={(e) => setSubjectType(e.target.value as (typeof SUBJECT_TYPES)[number])}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {SUBJECT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              placeholder="Max marks"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={passingMarks}
              onChange={(e) => setPassingMarks(e.target.value)}
              placeholder="Passing marks"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={
                !effectiveClassId ||
                createMutation.isPending ||
                (!subjectId && newName.trim().length === 0)
              }
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Add subject"}
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">{className} subject mapping</h2>
          <div className="mt-4 space-y-3">
            {(subjectsQuery.data?.subjects ?? []).length ? (
              (subjectsQuery.data?.subjects ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">{item.subject_name}</div>
                    <div className="mt-1 text-xs text-slate-600">
                      {item.subject_type} | Max {item.max_marks} | Pass {item.passing_marks}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="rounded-xl border border-rose-200 bg-white p-2 text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                No subjects linked to this grade yet.
              </div>
            )}
          </div>
        </article>
      </section>
    </AcademicSetupShell>
  );
}
