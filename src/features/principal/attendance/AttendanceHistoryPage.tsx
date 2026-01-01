import { useMemo, useState } from "react";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { formatIsoDate } from "../../../utils/date";
import { logger } from "../../../utils/logger";

type AttendanceStatus = "PRESENT" | "ABSENT";

type AttendanceRow = {
  studentId: number;
  rollNo: string;
  studentName: string;
  status: AttendanceStatus;
};

const MOCK_SECTIONS = [
  { id: "5A", label: "Class 5 - Section A" },
  { id: "5B", label: "Class 5 - Section B" },
  { id: "6A", label: "Class 6 - Section A" },
];

const MOCK_RESULTS: AttendanceRow[] = [
  { studentId: 1, rollNo: "01", studentName: "Student 1", status: "PRESENT" },
  { studentId: 2, rollNo: "02", studentName: "Student 2", status: "ABSENT" },
  { studentId: 3, rollNo: "03", studentName: "Student 3", status: "PRESENT" },
];

type UiState = "data" | "loading" | "empty" | "error";

export function AttendanceHistoryPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [sectionId, setSectionId] = useState<string>(MOCK_SECTIONS[0].id);
  const [dateIso, setDateIso] = useState<string>(formatIsoDate(new Date()));

  // UI-only state toggles (for skeleton validation)
  const [uiState, setUiState] = useState<UiState>("data");

  const results = uiState === "data" ? MOCK_RESULTS : [];

  const onFilterChange = (
    next: Partial<{ sectionId: string; dateIso: string }>
  ) => {
    if (next.sectionId !== undefined) setSectionId(next.sectionId);
    if (next.dateIso !== undefined) setDateIso(next.dateIso);

    logger.info("[principal][attendance-history] filters_changed", {
      trace,
      sectionId: next.sectionId ?? sectionId,
      dateIso: next.dateIso ?? dateIso,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="px-4 pt-6">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Attendance History
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Read-only view for Principal. Filters are UI-only in this step.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 space-y-5">
        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Section
              </label>
              <select
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={sectionId}
                onChange={(e) => onFilterChange({ sectionId: e.target.value })}
              >
                {MOCK_SECTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Date
              </label>
              <input
                type="date"
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={dateIso}
                onChange={(e) => onFilterChange({ dateIso: e.target.value })}
              />
            </div>
          </div>

          {/* Dev-only UI state toggles (no dependency, optional) */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(["data", "loading", "empty", "error"] as UiState[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setUiState(s)}
                className={[
                  "h-11 rounded-xl px-4 text-sm font-semibold",
                  uiState === s
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
                ].join(" ")}
              >
                {s === "data"
                  ? "Data"
                  : s === "loading"
                    ? "Loading"
                    : s === "empty"
                      ? "Empty"
                      : "Error"}
              </button>
            ))}
          </div>
        </div>

        {/* States */}
        {uiState === "loading" ? (
          <LoadingState label="Loading attendance..." />
        ) : null}

        {uiState === "error" ? (
          <ErrorState
            title="Unable to load attendance"
            message="This is a placeholder error state (UI-only)."
          />
        ) : null}

        {uiState === "empty" ? (
          <EmptyState message="No records for the selected date/section." />
        ) : null}

        {/* Results */}
        {uiState === "data" ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">Results</div>
              <div className="mt-1 text-xs font-medium text-gray-500">
                Section: <span className="text-gray-900">{sectionId}</span> •
                Date: <span className="text-gray-900">{dateIso}</span>
              </div>
            </div>

            <ul className="divide-y divide-gray-100">
              {results.map((r) => (
                <li key={r.studentId} className="px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 min-w-[44px] items-center justify-center rounded-lg bg-gray-100 px-2 text-sm font-bold text-gray-800">
                          {r.rollNo}
                        </span>
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {r.studentName}
                        </div>
                      </div>
                    </div>

                    <span
                      className={[
                        "inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold",
                        r.status === "PRESENT"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700",
                      ].join(" ")}
                    >
                      {r.status === "PRESENT" ? "Present" : "Absent"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="px-4 py-3 text-center text-sm text-gray-500">
              Showing {results.length} Students
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
