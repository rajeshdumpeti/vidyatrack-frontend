import { List, Plus, Sparkles, Table2 } from "lucide-react";
import type { UseFormHandleSubmit, UseFormRegister } from "react-hook-form";

import type { ClassDto } from "@/types/class.types";
import type { SectionDto } from "@/types/section.types";

import type {
  ManageSectionsFormValues,
  ManageSectionsViewMode,
} from "../types/manageSections.types";

type ManageSectionsRegistryProps = {
  selectedClass: ClassDto | null;
  filteredSections: SectionDto[];
  sectionsView: ManageSectionsViewMode;
  setSectionsView: (value: ManageSectionsViewMode) => void;
  register: UseFormRegister<ManageSectionsFormValues>;
  handleSubmit: UseFormHandleSubmit<ManageSectionsFormValues>;
  onSubmit: (values: ManageSectionsFormValues) => void;
  isSubmitting: boolean;
};

export function ManageSectionsRegistry({
  selectedClass,
  filteredSections,
  sectionsView,
  setSectionsView,
  register,
  handleSubmit,
  onSubmit,
  isSubmitting,
}: ManageSectionsRegistryProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-8">
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
  );
}
