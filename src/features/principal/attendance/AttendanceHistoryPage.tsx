import { useMemo, useState } from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatIsoDate } from "@/utils/date";
import { logger } from "@/utils/logger";
import { usePrincipalAttendanceHistory } from "@/hooks/usePrincipalAttendanceHistory";
import { useSections } from "@/hooks/useSections";
import type { PrincipalAttendanceRowDto } from "@/types/principalAttendance.types";
import type { SectionDto } from "@/types/section.types";

export function AttendanceHistoryPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [sectionId, setSectionId] = useState<number | "">("");
  const [dateIso, setDateIso] = useState<string>(formatIsoDate(new Date()));
  const q = usePrincipalAttendanceHistory(
    dateIso,
    sectionId === "" ? undefined : sectionId,
  );
  const sections = useSections().list;

  const sectionLabelById = useMemo(() => {
    const map = new Map<number, string>();
    (sections.data ?? []).forEach((s: SectionDto) => {
      const classLabel = s.class_name ?? `Class #${s.class_id}`;
      map.set(s.id, `${classLabel} - ${s.name}`);
    });
    return map;
  }, [sections.data]);

  const onFilterChange = (
    next: Partial<{ sectionId: number | ""; dateIso: string }>,
  ) => {
    if (next.sectionId !== undefined) setSectionId(next.sectionId);
    if (next.dateIso !== undefined) setDateIso(next.dateIso);

    logger.info("[principal][attendance-history] filters_changed", {
      trace,
      sectionId: next.sectionId ?? sectionId,
      dateIso: next.dateIso ?? dateIso,
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rows = (q.data ?? []) as PrincipalAttendanceRowDto[];

  const totals = useMemo(() => {
    const total = rows.length;
    const present = rows.filter((r) =>
      String(r.status).toUpperCase().includes("PRESENT"),
    ).length;
    const absent = total - present;
    const presentPct = total ? Math.round((present / total) * 100) : 0;
    const absentPct = total ? Math.round((absent / total) * 100) : 0;
    return { total, present, absent, presentPct, absentPct };
  }, [rows]);

  const breakdown = useMemo(() => {
    const map = new Map<number, { total: number; present: number }>();
    rows.forEach((r) => {
      const key = r.section_id ?? 0;
      const entry = map.get(key) ?? { total: 0, present: 0 };
      entry.total += 1;
      if (String(r.status).toUpperCase().includes("PRESENT")) {
        entry.present += 1;
      }
      map.set(key, entry);
    });

    return Array.from(map.entries()).map(([key, entry]) => {
      const label =
        key === 0
          ? "Unassigned Section"
          : (sectionLabelById.get(key) ?? `Section #${key}`);
      const absent = entry.total - entry.present;
      const pct = entry.total
        ? Math.round((entry.present / entry.total) * 100)
        : 0;
      return {
        key,
        label,
        total: entry.total,
        present: entry.present,
        absent,
        pct,
      };
    });
  }, [rows, sectionLabelById]);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="px-4 pt-6">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Attendance Overview
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Read-only view of daily attendance metrics across classes.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 space-y-5">
        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Section
              </label>
              <select
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={sectionId}
                onChange={(e) => {
                  const v = e.target.value;
                  onFilterChange({ sectionId: v === "" ? "" : Number(v) });
                }}
                disabled={sections.isLoading}
              >
                <option value="">All Sections</option>
                {(sections.data ?? []).map((s: SectionDto) => {
                  const label =
                    sectionLabelById.get(s.id) ?? `Section #${s.id}`;
                  return (
                    <option key={s.id} value={String(s.id)}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block text-sm font-semibold text-gray-900">
                Date
              </label>
              <input
                type="date"
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={dateIso}
                onChange={(e) => onFilterChange({ dateIso: e.target.value })}
              />
              <button
                type="button"
                className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                disabled
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* States */}
        {q.isLoading ? <LoadingState label="Loading attendance..." /> : null}

        {q.error ? (
          <ErrorState
            title="Unable to load attendance"
            message="Please try again."
          />
        ) : null}

        {!q.isLoading && !q.error && rows.length === 0 ? (
          <EmptyState message="No records for the selected date/section." />
        ) : null}

        {!q.isLoading && !q.error && rows.length > 0 ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">
                  Total Present
                </div>
                <div className="mt-2 text-2xl font-extrabold text-blue-600">
                  {totals.presentPct}%
                </div>
                <div className="text-xs text-gray-500">
                  {totals.present}/{totals.total}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">
                  Total Absent
                </div>
                <div className="mt-2 text-2xl font-extrabold text-red-600">
                  {totals.absentPct}%
                </div>
                <div className="text-xs text-gray-500">
                  {totals.absent}/{totals.total}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">
                  Late Arrivals
                </div>
                <div className="mt-2 text-2xl font-extrabold text-orange-500">
                  0%
                </div>
                <div className="text-xs text-gray-500">0/{totals.total}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">
                  On Leave
                </div>
                <div className="mt-2 text-2xl font-extrabold text-gray-700">
                  0%
                </div>
                <div className="text-xs text-gray-500">0/{totals.total}</div>
              </div>
            </div>

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
                    {breakdown.map((row) => (
                      <tr key={row.key}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {row.label}
                          </div>
                        </td>
                        <td className="px-4 py-3">{row.total}</td>
                        <td className="px-4 py-3 text-green-600">
                          {row.present}
                        </td>
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
                Showing {breakdown.length} classes
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
