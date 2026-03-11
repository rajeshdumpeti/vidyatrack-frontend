import type { AttendanceHistoryTotals } from "../types/attendanceHistory.types";

export function AttendanceHistorySummaryCards({
  totals,
}: {
  totals: AttendanceHistoryTotals;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-gray-500">Total Present</div>
        <div className="mt-2 text-2xl font-extrabold text-blue-600">
          {totals.presentPct}%
        </div>
        <div className="text-xs text-gray-500">
          {totals.present}/{totals.total}
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-gray-500">Total Absent</div>
        <div className="mt-2 text-2xl font-extrabold text-red-600">
          {totals.absentPct}%
        </div>
        <div className="text-xs text-gray-500">
          {totals.absent}/{totals.total}
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-gray-500">Late Arrivals</div>
        <div className="mt-2 text-2xl font-extrabold text-orange-500">0%</div>
        <div className="text-xs text-gray-500">0/{totals.total}</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-gray-500">On Leave</div>
        <div className="mt-2 text-2xl font-extrabold text-gray-700">0%</div>
        <div className="text-xs text-gray-500">0/{totals.total}</div>
      </div>
    </div>
  );
}
