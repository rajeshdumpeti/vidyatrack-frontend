import { useMemo, useState } from "react";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { logger } from "../../../utils/logger";

type MarksRow = {
  studentId: number;
  rollNo: string;
  studentName: string;
  marks: number;
  maxMarks: number;
};

const MOCK_SECTIONS = [
  { id: "5A", label: "Class 5 - Section A" },
  { id: "5B", label: "Class 5 - Section B" },
  { id: "6A", label: "Class 6 - Section A" },
];

const MOCK_SUBJECTS = [
  { id: "math", label: "Mathematics" },
  { id: "eng", label: "English" },
  { id: "sci", label: "Science" },
];

const MOCK_EXAMS = [
  { id: "UNIT_TEST", label: "Unit Test" },
  { id: "MONTHLY_TEST", label: "Monthly Test" },
  { id: "QUARTERLY", label: "Quarterly" },
];

const MOCK_RESULTS: MarksRow[] = [
  {
    studentId: 1,
    rollNo: "01",
    studentName: "Student 1",
    marks: 28,
    maxMarks: 30,
  },
  {
    studentId: 2,
    rollNo: "02",
    studentName: "Student 2",
    marks: 19,
    maxMarks: 30,
  },
  {
    studentId: 3,
    rollNo: "03",
    studentName: "Student 3",
    marks: 30,
    maxMarks: 30,
  },
];

type UiState = "data" | "loading" | "empty" | "error";

export function MarksHistoryPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [sectionId, setSectionId] = useState<string>(MOCK_SECTIONS[0].id);
  const [subjectId, setSubjectId] = useState<string>(MOCK_SUBJECTS[0].id);
  const [examType, setExamType] = useState<string>(MOCK_EXAMS[0].id);

  // UI-only state toggles (for skeleton validation)
  const [uiState, setUiState] = useState<UiState>("data");

  const results = uiState === "data" ? MOCK_RESULTS : [];

  const onFilterChange = (
    next: Partial<{ sectionId: string; subjectId: string; examType: string }>
  ) => {
    if (next.sectionId !== undefined) setSectionId(next.sectionId);
    if (next.subjectId !== undefined) setSubjectId(next.subjectId);
    if (next.examType !== undefined) setExamType(next.examType);

    logger.info("[principal][marks-history] filters_changed", {
      trace,
      sectionId: next.sectionId ?? sectionId,
      subjectId: next.subjectId ?? subjectId,
      examType: next.examType ?? examType,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="px-4 pt-6">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Marks History
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Read-only view for Principal. Filters are UI-only in this step.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 space-y-5">
        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                Subject
              </label>
              <select
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={subjectId}
                onChange={(e) => onFilterChange({ subjectId: e.target.value })}
              >
                {MOCK_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Exam Type
              </label>
              <select
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={examType}
                onChange={(e) => onFilterChange({ examType: e.target.value })}
              >
                {MOCK_EXAMS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dev-only UI state toggles (no dependency) */}
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
          <LoadingState label="Loading marks..." />
        ) : null}

        {uiState === "error" ? (
          <ErrorState
            title="Unable to load marks"
            message="This is a placeholder error state (UI-only)."
          />
        ) : null}

        {uiState === "empty" ? (
          <EmptyState message="No records for the selected filters." />
        ) : null}

        {/* Results */}
        {uiState === "data" ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">Results</div>
              <div className="mt-1 text-xs font-medium text-gray-500">
                Section: <span className="text-gray-900">{sectionId}</span> •
                Subject: <span className="text-gray-900">{subjectId}</span> •
                Exam: <span className="text-gray-900">{examType}</span>
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
                      <div className="mt-1 text-xs font-medium text-gray-500">
                        Marks: <span className="text-gray-900">{r.marks}</span>{" "}
                        / <span className="text-gray-900">{r.maxMarks}</span>
                      </div>
                    </div>

                    <span className="inline-flex h-9 items-center rounded-full bg-gray-900 px-4 text-sm font-semibold text-white">
                      {r.marks}/{r.maxMarks}
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
