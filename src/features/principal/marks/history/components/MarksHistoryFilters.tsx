import { FileDown } from "lucide-react";

import { EXAM_TYPE_PRESETS } from "@/constants/examTypes";
import type { SectionDto } from "@/types/section.types";

type SubjectOption = {
  id: number;
  name: string;
};

type MarksHistoryFiltersProps = {
  sectionId: number | "";
  subjectId: number | "";
  selectedSubjectId: number;
  examType: string;
  sections: SectionDto[];
  subjects: SubjectOption[];
  sectionsLoading: boolean;
  subjectsLoading: boolean;
  sectionLabelById: Map<number, string>;
  onFilterChange: (
    next: Partial<{
      sectionId: number | "";
      subjectId: number | "";
      examType: string;
    }>,
  ) => void;
  onExport: () => void;
};

export function MarksHistoryFilters({
  sectionId,
  subjectId,
  selectedSubjectId,
  examType,
  sections,
  subjects,
  sectionsLoading,
  subjectsLoading,
  sectionLabelById,
  onFilterChange,
  onExport,
}: MarksHistoryFiltersProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div>
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
            {sections.map((section) => (
              <option key={section.id} value={String(section.id)}>
                {sectionLabelById.get(section.id) ?? `Section #${section.id}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Subject
          </label>
          <select
            className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={subjectId === "" ? String(selectedSubjectId || "") : String(subjectId)}
            onChange={(event) =>
              onFilterChange({ subjectId: Number(event.target.value) })
            }
            disabled={subjectsLoading || !subjects.length}
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={String(subject.id)}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Exam Type
          </label>
          <select
            className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={examType}
            onChange={(event) => onFilterChange({ examType: event.target.value })}
          >
            {EXAM_TYPE_PRESETS.map((exam) => (
              <option key={exam.value} value={exam.value}>
                {exam.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <FileDown className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
