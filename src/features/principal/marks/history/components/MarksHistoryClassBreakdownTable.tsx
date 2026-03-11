import type { MarksHistoryClassBreakdownRow } from "../types/marksHistory.types";

export function MarksHistoryClassBreakdownTable({
  rows,
}: {
  rows: MarksHistoryClassBreakdownRow[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm font-semibold text-gray-900">
          Class-wise Breakdown
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Class Name</th>
              <th className="px-4 py-3">Students</th>
              <th className="px-4 py-3">Avg %</th>
              <th className="px-4 py-3">Pass</th>
              <th className="px-4 py-3">Fail</th>
              <th className="px-4 py-3">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {row.label}
                </td>
                <td className="px-4 py-3">{row.total}</td>
                <td className="px-4 py-3 text-blue-600">{row.avgPct}%</td>
                <td className="px-4 py-3 text-green-600">{row.pass}</td>
                <td className="px-4 py-3 text-red-600">{row.fail}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-full max-w-[160px] rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${row.avgPct}%` }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-gray-600">
                      {row.avgPct}%
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
