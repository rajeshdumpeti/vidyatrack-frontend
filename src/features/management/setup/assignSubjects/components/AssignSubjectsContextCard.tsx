import { Plus } from "lucide-react";

import type {
  AssignSubjectsClassDto,
  AssignSubjectsSectionDto,
} from "../types/assignSubjects.types";

type AssignSubjectsContextCardProps = {
  classId: number | null;
  sectionId: number | null;
  classes: AssignSubjectsClassDto[];
  sections: AssignSubjectsSectionDto[];
  sectionsLoading: boolean;
  noSectionsForClass: boolean;
  selectedClass?: AssignSubjectsClassDto;
  onClassChange: (value: number | null) => void;
  onSectionChange: (value: number | null) => void;
  onCreateDefaultSection: () => void;
  isCreatingDefaultSection: boolean;
};

export function AssignSubjectsContextCard({
  classId,
  sectionId,
  classes,
  sections,
  sectionsLoading,
  noSectionsForClass,
  selectedClass,
  onClassChange,
  onSectionChange,
  onCreateDefaultSection,
  isCreatingDefaultSection,
}: AssignSubjectsContextCardProps) {
  return (
    <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-4">
      <h3 className="text-sm font-bold text-slate-900">Assignment Context</h3>
      <div>
        <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Class
        </label>
        <select
          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={classId ?? ""}
          onChange={(event) =>
            onClassChange(event.target.value ? Number(event.target.value) : null)
          }
        >
          <option value="">Select class</option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Section
        </label>
        <select
          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
          value={sectionId ?? ""}
          onChange={(event) =>
            onSectionChange(event.target.value ? Number(event.target.value) : null)
          }
          disabled={!classId || noSectionsForClass}
        >
          <option value="">
            {sectionsLoading ? "Loading..." : "Select section"}
          </option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
      </div>

      {noSectionsForClass ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-800">
            No sections found for {selectedClass?.name ?? "selected class"}.
          </p>
          <button
            type="button"
            onClick={onCreateDefaultSection}
            disabled={isCreatingDefaultSection}
            className="mt-2 inline-flex h-9 items-center gap-1 rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
            {isCreatingDefaultSection ? 'Creating...' : 'Create "General"'}
          </button>
        </div>
      ) : null}
    </article>
  );
}
