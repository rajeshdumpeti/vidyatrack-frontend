import type { StudentImportCommitResponse } from "@/types/student.types";

export function ManagementStudentsImportResult({
  commitResult,
}: {
  commitResult: StudentImportCommitResponse;
}) {
  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm font-semibold text-gray-900">Import Completed</div>
      <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="text-sm text-gray-700">
          Total: <strong>{commitResult.total_rows}</strong>
        </div>
        <div className="text-sm text-green-700">
          Created: <strong>{commitResult.created_rows}</strong>
        </div>
        <div className="text-sm text-amber-700">
          Duplicates: <strong>{commitResult.duplicate_rows}</strong>
        </div>
        <div className="text-sm text-red-700">
          Failed: <strong>{commitResult.failed_rows}</strong>
        </div>
      </div>
    </div>
  );
}
