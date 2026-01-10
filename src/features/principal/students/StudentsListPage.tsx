import { useMemo, useState } from "react";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { logger } from "../../../utils/logger";

type StudentRow = {
  studentId: number;
  rollNo: string;
  name: string;
  sectionLabel: string;
  parentPhone?: string;
};

const MOCK_SECTIONS = [
  { id: "ALL", label: "All Sections" },
  { id: "5A", label: "Class 5 - Section A" },
  { id: "5B", label: "Class 5 - Section B" },
  { id: "6A", label: "Class 6 - Section A" },
];

const MOCK_STUDENTS: StudentRow[] = [
  {
    studentId: 1,
    rollNo: "01",
    name: "Student 1",
    sectionLabel: "Class 5 - Section A",
    parentPhone: "9999999999",
  },
  {
    studentId: 2,
    rollNo: "02",
    name: "Student 2",
    sectionLabel: "Class 5 - Section A",
    parentPhone: "9999999999",
  },
  {
    studentId: 3,
    rollNo: "03",
    name: "Student 3",
    sectionLabel: "Class 5 - Section B",
    parentPhone: "9999999999",
  },
  {
    studentId: 4,
    rollNo: "04",
    name: "Student 4",
    sectionLabel: "Class 6 - Section A",
    parentPhone: "9999999999",
  },
];

type UiState = "data" | "loading" | "empty" | "error";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function StudentsListPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [sectionId, setSectionId] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  // UI-only state toggles (for skeleton verification)
  const [uiState, setUiState] = useState<UiState>("data");

  const filtered = useMemo(() => {
    const q = normalize(search);
    const bySection =
      sectionId === "ALL"
        ? MOCK_STUDENTS
        : MOCK_STUDENTS.filter((s) => s.sectionLabel.includes(sectionId));

    if (!q) return bySection;

    return bySection.filter((s) => {
      return normalize(s.name).includes(q) || normalize(s.rollNo).includes(q);
    });
  }, [search, sectionId]);

  const results = uiState === "data" ? filtered : [];

  const onFilterChange = (
    next: Partial<{ sectionId: string; search: string }>
  ) => {
    if (next.sectionId !== undefined) setSectionId(next.sectionId);
    if (next.search !== undefined) setSearch(next.search);

    logger.info("[principal][students] filters_changed", {
      trace,
      sectionId: next.sectionId ?? sectionId,
      search: next.search ?? search,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="px-4 pt-6">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Students
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Read-only lookup for Principal. Filters are UI-only in this step.
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
                Search (Name / Roll No)
              </label>
              <input
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={search}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                placeholder="Type student name or roll no"
                inputMode="search"
              />
            </div>
          </div>

          {/* Dev-only UI state toggles */}
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
          <LoadingState label="Loading students..." />
        ) : null}

        {uiState === "error" ? (
          <ErrorState
            title="Unable to load students"
            message="This is a placeholder error state (UI-only)."
          />
        ) : null}

        {uiState === "empty" ? (
          <EmptyState message="No students match the selected filters." />
        ) : null}

        {/* Results */}
        {uiState === "data" ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">Results</div>
              <div className="mt-1 text-xs font-medium text-gray-500">
                Showing {results.length} Students
              </div>
            </div>

            <ul className="divide-y divide-gray-100">
              {results.map((s) => (
                <li key={s.studentId} className="px-4 py-4">
                  {/* Touch target >= 44px */}
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 rounded-xl p-2 text-left hover:bg-gray-50"
                    onClick={() =>
                      logger.info("[principal][students] row_tap", {
                        trace,
                        studentId: s.studentId,
                      })
                    }
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 min-w-[44px] items-center justify-center rounded-lg bg-gray-100 px-2 text-sm font-bold text-gray-800">
                          {s.rollNo}
                        </span>
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {s.name}
                        </div>
                      </div>

                      <div className="mt-2 text-xs font-medium text-gray-500">
                        Section:{" "}
                        <span className="text-gray-900">{s.sectionLabel}</span>
                        {s.parentPhone ? (
                          <>
                            {" "}
                            • Parent:{" "}
                            <span className="text-gray-900">
                              {s.parentPhone}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <span className="inline-flex h-9 items-center rounded-full bg-gray-900 px-4 text-sm font-semibold text-white">
                      View
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </main>
    </div>
  );
}
