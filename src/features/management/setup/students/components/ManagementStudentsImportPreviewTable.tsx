import type { StudentImportPreviewResponse } from "@/types/student.types";

type ManagementStudentsImportPreviewTableProps = {
  previewData: StudentImportPreviewResponse;
  mapImportError: (code: string) => string;
};

export function ManagementStudentsImportPreviewTable({
  previewData,
  mapImportError,
}: ManagementStudentsImportPreviewTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2">Row</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Student</th>
              <th className="px-3 py-2">Class</th>
              <th className="px-3 py-2">Section</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Errors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {previewData.rows.map((row) => (
              <tr key={row.row_number}>
                <td className="px-3 py-2">{row.row_number}</td>
                <td className="px-3 py-2">
                  <span
                    className={[
                      "rounded-full px-2 py-1 text-xs font-semibold",
                      row.status === "valid"
                        ? "bg-green-50 text-green-700"
                        : row.status === "duplicate"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700",
                    ].join(" ")}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-2">{row.student_name || "—"}</td>
                <td className="px-3 py-2">{row.class_name || "—"}</td>
                <td className="px-3 py-2">{row.section_name || "—"}</td>
                <td className="px-3 py-2">{row.parent_phone || "—"}</td>
                <td className="px-3 py-2 text-xs text-red-700">
                  {row.errors.length
                    ? row.errors.map(mapImportError).join(", ")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
