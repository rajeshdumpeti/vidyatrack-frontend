import type { StudentImportPreviewResponse } from "@/types/student.types";

type PreviewGroup = {
  label: string;
  count: number;
};

type ManagementStudentsImportSummaryProps = {
  previewData: StudentImportPreviewResponse;
  previewAcademicGroups: PreviewGroup[];
};

export function ManagementStudentsImportSummary({
  previewData,
  previewAcademicGroups,
}: ManagementStudentsImportSummaryProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="text-xs text-gray-500">Total Rows</div>
          <div className="text-lg font-semibold text-gray-900">
            {previewData.total_rows}
          </div>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
          <div className="text-xs text-green-700">Valid</div>
          <div className="text-lg font-semibold text-green-800">
            {previewData.valid_rows}
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="text-xs text-amber-700">Duplicates</div>
          <div className="text-lg font-semibold text-amber-800">
            {previewData.duplicate_rows}
          </div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
          <div className="text-xs text-red-700">Invalid</div>
          <div className="text-lg font-semibold text-red-800">
            {previewData.invalid_rows}
          </div>
        </div>
      </div>

      {previewAcademicGroups.length > 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Academic Distribution (Preview)
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {previewAcademicGroups.map((group) => (
              <span
                key={group.label}
                className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
              >
                {group.label}: {group.count}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
