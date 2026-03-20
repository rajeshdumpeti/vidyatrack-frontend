import type { MarksHistoryTotals } from "../types/marksHistory.types";

export function MarksHistorySummaryCards({
  totals,
}: {
  totals: MarksHistoryTotals;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-gray-500">Average Score</div>
        <div className="mt-2 text-2xl font-extrabold text-blue-600">
          {totals.avgPct}%
        </div>
        <div className="text-xs text-gray-500">{totals.avgScore} marks avg</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-gray-500">Pass Rate</div>
        <div className="mt-2 text-2xl font-extrabold text-green-600">
          {totals.passPct}%
        </div>
        <div className="text-xs text-gray-500">
          {totals.passCount}/{totals.total} students
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-gray-500">Top Score</div>
        <div className="mt-2 text-2xl font-extrabold text-indigo-600">
          {totals.topScore}
        </div>
        <div className="text-xs text-gray-500">out of 100-scale equivalent</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-gray-500">Below Threshold</div>
        <div className="mt-2 text-2xl font-extrabold text-red-600">
          {totals.belowThreshold}
        </div>
        <div className="text-xs text-gray-500">needs improvement</div>
      </div>
    </div>
  );
}
