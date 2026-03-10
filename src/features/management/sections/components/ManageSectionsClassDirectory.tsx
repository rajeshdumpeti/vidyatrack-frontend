import { Layers } from "lucide-react";

import type { ClassDto } from "@/types/class.types";
import type { SectionDto } from "@/types/section.types";

type ManageSectionsClassDirectoryProps = {
  classList: ClassDto[];
  sectionList: SectionDto[];
  activeClassId: number | null;
  onSelectClass: (classId: number) => void;
};

export function ManageSectionsClassDirectory({
  classList,
  sectionList,
  activeClassId,
  onSelectClass,
}: ManageSectionsClassDirectoryProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-4">
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
                (section) => section.class_id === classItem.id,
              ).length;
              const isActive = activeClassId === classItem.id;

              return (
                <button
                  key={classItem.id}
                  type="button"
                  onClick={() => onSelectClass(classItem.id)}
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
  );
}
