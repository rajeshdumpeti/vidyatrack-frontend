import type { AttendanceHistoryBreakdownRow } from "../types/attendanceHistory.types";

export function AttendanceHistoryBreakdownTable({
  rows,
}: {
  rows: AttendanceHistoryBreakdownRow[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm font-semibold text-gray-900">
          Class-wise Breakdown
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Class Name</th>
              <th className="px-4 py-3">Total Strength</th>
              <th className="px-4 py-3">Present</th>
              <th className="px-4 py-3">Absent</th>
              <th className="px-4 py-3">Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {row.label}
                  </div>
                </td>
                <td className="px-4 py-3">{row.total}</td>
                <td className="px-4 py-3 text-green-600">{row.present}</td>
                <td className="px-4 py-3 text-red-600">{row.absent}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-full max-w-[160px] rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-gray-600">
                      {row.pct}%
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 text-xs text-gray-500">
        Showing {rows.length} classes
      </div>
    </div>
  );
}
