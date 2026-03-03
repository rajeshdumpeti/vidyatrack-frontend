import { useMemo, useState } from "react";
import { BookText, Plus, Search, Shapes } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSubjects, useCreateSubject } from "@/hooks/useSubjects";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { logger } from "@/utils/logger";
import { AcademicSetupShell } from "./AcademicSetupShell";
import { useAuthStore } from "@/store/auth.store";
import { listTeachingAssignments } from "@/api/teachingAssignments.api";
import { useSections } from "@/hooks/useSections";
import type { TeachingAssignmentDto } from "@/types/teachingAssignment.types";
import type { SectionDto } from "@/types/section.types";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function SubjectsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const { data, isLoading, error, refetch } = useSubjects();
  const createMutation = useCreateSubject();
  const { schoolId } = useAuthStore();
  const sections = useSections().list;

  const assignmentsQuery = useQuery({
    queryKey: ["teaching-assignments", schoolId, "all-subjects"],
    queryFn: () => listTeachingAssignments(schoolId!),
    enabled: !!schoolId,
    retry: 1,
  });

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;
    return data.filter((s) => normalize(s.name).includes(q));
  }, [data, search]);

  const sectionsById = useMemo(() => {
    const map = new Map<number, SectionDto>();
    (sections.data ?? []).forEach((section) => map.set(section.id, section));
    return map;
  }, [sections.data]);

  const subjectUsage = useMemo(() => {
    const map = new Map<
      number,
      { teacherCount: number; classCount: number; sectionCount: number }
    >();
    const assignments = (assignmentsQuery.data ?? []) as TeachingAssignmentDto[];

    assignments.forEach((assignment) => {
      const current = map.get(assignment.subject_id) ?? {
        teacherCount: 0,
        classCount: 0,
        sectionCount: 0,
      };
      const teacherSet = new Set<number>();
      const classSet = new Set<number>();
      const sectionSet = new Set<number>();

      assignments
        .filter((row) => row.subject_id === assignment.subject_id)
        .forEach((row) => {
          teacherSet.add(row.teacher_id);
          sectionSet.add(row.section_id);
          const section = sectionsById.get(row.section_id);
          if (section?.class_id) classSet.add(section.class_id);
        });

      current.teacherCount = teacherSet.size;
      current.classCount = classSet.size;
      current.sectionCount = sectionSet.size;
      map.set(assignment.subject_id, current);
    });

    return map;
  }, [assignmentsQuery.data, sectionsById]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setInlineError("Subject name is required.");
      return;
    }
    if (trimmed.length < 2) {
      setInlineError("Enter at least 2 characters.");
      return;
    }

    setInlineError(null);
    createMutation.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          setName("");
          logger.info("[subjects] create_success", { trace, name: trimmed });
        },
        onError: (err) => {
          logger.warn("[subjects] create_failed", { trace, err });
          setInlineError("Unable to create subject. Please try again.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <LoadingState label="Loading subject catalog..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-16 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ErrorState
          title="Unable to load subjects"
          message="Please retry to restore catalog data."
        />
        <button
          type="button"
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AcademicSetupShell
      title="Subject Catalog"
      description="Maintain the canonical subject list before assigning teaching load."
      icon={BookText}
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Registered Subjects
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {filtered.length}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Matching current filters.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Data Quality
          </p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">Ready</p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Catalog supports assignment workflows.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Last Update
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">Live</p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Changes appear instantly.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={submit}
          className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]"
        >
          <div className="relative">
            <Shapes className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (inlineError) setInlineError(null);
              }}
              placeholder="Add subject (e.g. Environmental Science)"
              className={`h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                inlineError ? "border-red-300" : "border-slate-200"
              }`}
              disabled={createMutation.isPending}
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !name.trim()}
            className="inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? "Saving..." : "Add Subject"}
          </button>
        </form>
        {inlineError ? (
          <p className="mt-2 text-xs font-semibold text-red-600">{inlineError}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-sm font-bold text-slate-900">Subject Directory</h3>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        <div className="p-4">
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-10 text-center text-sm font-medium text-slate-500">
              No subjects found for this filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((subject) => (
                <article
                  key={subject.id}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {subject.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      Required for{" "}
                      {subjectUsage.get(subject.id)?.classCount ?? 0} classes
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Assigned to{" "}
                      {subjectUsage.get(subject.id)?.teacherCount ?? 0} teachers
                    </span>
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                      Used in{" "}
                      {subjectUsage.get(subject.id)?.sectionCount ?? 0} sections
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </AcademicSetupShell>
  );
}
