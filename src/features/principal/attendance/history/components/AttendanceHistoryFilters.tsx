import { CalendarDays, FileDown } from "lucide-react";

import type { SectionDto } from "@/types/section.types";

type AttendanceHistoryFiltersProps = {
  sectionId: number | "";
  dateIso: string;
  todayIso: string;
  sections: SectionDto[];
  sectionsLoading: boolean;
  sectionLabelById: Map<number, string>;
  onFilterChange: (
    next: Partial<{ sectionId: number | ""; dateIso: string }>,
  ) => void;
};

export function AttendanceHistoryFilters({
  sectionId,
  dateIso,
  todayIso,
  sections,
  sectionsLoading,
  sectionLabelById,
  onFilterChange,
}: AttendanceHistoryFiltersProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-900">
            Section
          </label>
          <select
            className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={sectionId}
            onChange={(event) => {
              const value = event.target.value;
              onFilterChange({ sectionId: value === "" ? "" : Number(value) });
            }}
            disabled={sectionsLoading}
          >
            <option value="">All Sections</option>
            {sections.map((section) => {
              const label = sectionLabelById.get(section.id) ?? `Section #${section.id}`;
              return (
                <option key={section.id} value={String(section.id)}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900">Date</label>
          <div className="relative mt-2">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={dateIso}
              max={todayIso}
              onChange={(event) => onFilterChange({ dateIso: event.target.value })}
            />
          </div>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            disabled
          >
            <FileDown className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
