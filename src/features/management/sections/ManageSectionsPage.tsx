import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Boxes, Layers, List, Plus, Sparkles, Table2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { logger } from "@/utils/logger";
import type { ClassDto } from "@/types/class.types";
import type { SectionDto } from "@/types/section.types";
import { AcademicSetupShell } from "../setup/AcademicSetupShell";

type FormValues = {
  class_id: string;
  name: string;
};

export function ManageSectionsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const { schoolId } = useAuthStore();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [sectionsView, setSectionsView] = useState<"chips" | "table">("chips");
  const [newClassName, setNewClassName] = useState("");
  const classes = useClasses();
  const sections = useSections();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { class_id: "", name: "" },
  });

  const classList = useMemo(
    () => (classes.list.data ?? []) as ClassDto[],
    [classes.list.data],
  );
  const sectionList = useMemo(
    () => (sections.list.data ?? []) as SectionDto[],
    [sections.list.data],
  );
  const activeClassId = useMemo(() => {
    if (
      selectedClassId &&
      classList.some((classItem) => classItem.id === selectedClassId)
    ) {
      return selectedClassId;
    }
    return null;
  }, [classList, selectedClassId]);

  const filteredSections = useMemo(
    () => sectionList.filter((s) => s.class_id === activeClassId),
    [activeClassId, sectionList],
  );

  const selectedClass = useMemo(
    () => classList.find((c) => c.id === activeClassId) ?? null,
    [activeClassId, classList],
  );

  const onSubmit = (values: FormValues) => {
    if (!activeClassId || !schoolId) {
      logger.error("[academic][sections] missing_context", {
        trace,
        selectedClassId: activeClassId,
        schoolId,
      });
      return;
    }

    sections.create.mutate(
      {
        class_id: activeClassId,
        name: values.name.trim(),
        school_id: schoolId,
      },
      {
        onSuccess: () => {
          reset({ class_id: values.class_id, name: "" });
          logger.info("[academic][sections] create_success", { trace });
        },
      },
    );
  };

  return (
    <AcademicSetupShell
      title="Class Preparation"
      description="Design class and section structure with predictable operational controls."
      icon={Boxes}
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Quick Create
          </p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-900">
            Add New Class
          </h2>
          <div className="mt-3 flex gap-2">
            <input
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. Grade 9"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => {
                if (!newClassName.trim() || !schoolId) return;
                classes.create.mutate(
                  { name: newClassName.trim(), school_id: schoolId },
                  { onSuccess: () => setNewClassName("") },
                );
              }}
              disabled={classes.create.isPending}
              className="inline-flex h-11 items-center gap-1 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Total Classes
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {classList.length}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Current school class groups.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Total Sections
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {sectionList.length}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Distributed across all classes.
          </p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <article className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">Class Directory</h3>
          </div>
          <div className="max-h-[540px] overflow-y-auto p-3">
            {classList.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm font-medium text-slate-500">
                No classes yet.
              </p>
            ) : (
              <div className="space-y-2">
                {classList.map((classItem) => {
                  const sectionCount = sectionList.filter(
                    (s) => s.class_id === classItem.id,
                  ).length;
                  const isActive = activeClassId === classItem.id;
                  return (
                    <button
                      key={classItem.id}
                      type="button"
                      onClick={() => setSelectedClassId(classItem.id)}
                      className={[
                        "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                        isActive
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {classItem.name}
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {sectionCount} sections
                          </p>
                        </div>
                        <Layers className="h-4 w-4 text-slate-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </article>

        <article className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">
              {selectedClass
                ? `Section Registry • ${selectedClass.name}`
                : "Section Registry"}
            </h3>
          </div>

          {!selectedClass ? (
            <div className="m-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Select a class to manage sections
              </p>
            </div>
          ) : (
            <div className="p-4">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mb-4 flex flex-col gap-2 sm:flex-row"
              >
                <input
                  {...register("name", { required: true })}
                  placeholder="e.g. Section A"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  Add Section
                </button>
              </form>

              {filteredSections.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm font-medium text-slate-500">
                  No sections found for this class.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Sections ({filteredSections.length})
                    </p>
                    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                      <button
                        type="button"
                        onClick={() => setSectionsView("chips")}
                        className={[
                          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
                          sectionsView === "chips"
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <List className="h-3.5 w-3.5" />
                        Chips
                      </button>
                      <button
                        type="button"
                        onClick={() => setSectionsView("table")}
                        className={[
                          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
                          sectionsView === "table"
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <Table2 className="h-3.5 w-3.5" />
                        Table
                      </button>
                    </div>
                  </div>
                  {sectionsView === "chips" ? (
                    <div className="flex flex-wrap gap-2">
                      {filteredSections.map((section) => (
                        <span
                          key={section.id}
                          className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700"
                          title={`Section ${section.name}`}
                        >
                          {section.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-3 py-2">Section</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredSections.map((section) => (
                            <tr key={section.id}>
                              <td className="px-3 py-2 font-semibold text-slate-900">
                                {section.name}
                              </td>
                              <td className="px-3 py-2">
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </article>
      </section>
    </AcademicSetupShell>
  );
}
