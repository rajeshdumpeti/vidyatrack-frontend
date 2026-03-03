import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { logger } from "@/utils/logger";
import { usePrincipalMarksHistory } from "@/hooks/usePrincipalMarksHistory";
import { useSections } from "@/hooks/useSections";
import { useSubjects } from "@/hooks/useSubjects";
import { useAuthStore } from "@/store/auth.store";
import type { PrincipalMarksRowDto } from "@/types/principalMarks.types";
import type { SectionDto } from "@/types/section.types";
import { InsightState } from "@/components/feedback/InsightState";
import { ArrowLeft, FileDown } from "lucide-react";

const EXAM_TYPES = [
  { value: "UNIT_TEST", label: "Unit Test" },
  { value: "MONTHLY_TEST", label: "Monthly Test" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "HALF_YEARLY", label: "Half Yearly" },
  { value: "ANNUAL", label: "Annual" },
];

function pct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

export function MarksHistoryPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const navigateRole = role ?? "principal";
  const backLink =
    navigateRole === "management" ? "/management" : `/${navigateRole}`;
  const sections = useSections().list;
  const subjects = useSubjects();
  const [sectionId, setSectionId] = useState<number | "">("");
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [examType, setExamType] = useState<string>("UNIT_TEST");
  const [search, setSearch] = useState("");

  const sectionLabelById = useMemo(() => {
    const map = new Map<number, string>();
    (sections.data ?? []).forEach((s: SectionDto) => {
      const classLabel = s.class_name ?? `Class #${s.class_id}`;
      map.set(s.id, `${classLabel} - ${s.name}`);
    });
    return map;
  }, [sections.data]);

  const selectedSubjectId =
    subjectId === "" ? Number(subjects.data?.[0]?.id ?? 0) : Number(subjectId);

  const q = usePrincipalMarksHistory({
    sectionId: sectionId === "" ? undefined : Number(sectionId),
    subjectId: selectedSubjectId > 0 ? selectedSubjectId : undefined,
    examType,
  });

  const rows = (q.data ?? []) as PrincipalMarksRowDto[];

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      const name = String(r.student_name ?? "").toLowerCase();
      const roll = String(r.roll_no ?? "").toLowerCase();
      return name.includes(term) || roll.includes(term);
    });
  }, [rows, search]);

  const rosterPagination = usePagination(filteredRows, {
    initialPageSize: 20,
    resetDeps: [sectionId, subjectId, examType, search],
  });

  const totals = useMemo(() => {
    const total = rows.length;
    const totalObtained = rows.reduce((sum, r) => sum + r.marks_obtained, 0);
    const totalMax = rows.reduce((sum, r) => sum + r.max_marks, 0);
    const avgScore = total ? totalObtained / total : 0;
    const avgPct = totalMax ? (totalObtained / totalMax) * 100 : 0;
    const passCount = rows.filter((r) => (r.marks_obtained / r.max_marks) * 100 >= 35).length;
    const belowThreshold = total - passCount;
    const topScore = rows.reduce((max, r) => Math.max(max, r.marks_obtained), 0);
    return {
      total,
      avgScore: Math.round(avgScore * 10) / 10,
      avgPct: pct(avgPct),
      passCount,
      passPct: total ? pct((passCount / total) * 100) : 0,
      belowThreshold,
      topScore,
    };
  }, [rows]);

  const classBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        label: string;
        total: number;
        obtained: number;
        max: number;
        pass: number;
      }
    >();

    rows.forEach((r) => {
      const key = `${r.class_name ?? ""}|${r.section_name ?? ""}|${r.section_id ?? 0}`;
      const fallbackSection =
        r.section_id != null ? sectionLabelById.get(r.section_id) : undefined;
      const label =
        (r.class_name && r.section_name
          ? `${r.class_name} - ${r.section_name}`
          : fallbackSection) ?? "Unknown Section";
      const entry = map.get(key) ?? {
        label,
        total: 0,
        obtained: 0,
        max: 0,
        pass: 0,
      };
      entry.total += 1;
      entry.obtained += r.marks_obtained;
      entry.max += r.max_marks;
      if ((r.marks_obtained / r.max_marks) * 100 >= 35) entry.pass += 1;
      map.set(key, entry);
    });

    return Array.from(map.values()).map((entry) => {
      const avgPct = entry.max ? pct((entry.obtained / entry.max) * 100) : 0;
      return {
        ...entry,
        avgPct,
        fail: entry.total - entry.pass,
      };
    });
  }, [rows, sectionLabelById]);

  const exportCsv = () => {
    if (!filteredRows.length) return;
    const lines = [
      ["student_id", "student_name", "roll_no", "class_name", "section_name", "subject", "exam_type", "marks_obtained", "max_marks"].join(","),
      ...filteredRows.map((r) =>
        [
          r.student_id,
          `"${(r.student_name ?? "").replace(/"/g, '""')}"`,
          r.roll_no ?? "",
          `"${(r.class_name ?? "").replace(/"/g, '""')}"`,
          `"${(r.section_name ?? "").replace(/"/g, '""')}"`,
          `"${(r.subject_name ?? "").replace(/"/g, '""')}"`,
          r.exam_type,
          r.marks_obtained,
          r.max_marks,
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marks_${examType.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFilterChange = (
    next: Partial<{ sectionId: number | ""; subjectId: number | ""; examType: string }>,
  ) => {
    if (next.sectionId !== undefined) setSectionId(next.sectionId);
    if (next.subjectId !== undefined) setSubjectId(next.subjectId);
    if (next.examType !== undefined) setExamType(next.examType);
    logger.info("[principal][marks-overview] filters_changed", {
      trace,
      sectionId: next.sectionId ?? sectionId,
      subjectId: next.subjectId ?? subjectId,
      examType: next.examType ?? examType,
    });
  };

  const loading = q.isLoading || sections.isLoading || subjects.isLoading;
  const hasData = !loading && !q.error && rows.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="px-4 pt-6">
        <div className="mx-auto w-full max-w-6xl">
          <Link
            to={backLink}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {navigateRole === "management" ? "Management" : "Overview"}
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Marks Overview
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Read-only exam performance metrics across classes and sections.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
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
                {(sections.data ?? []).map((s: SectionDto) => (
                  <option key={s.id} value={String(s.id)}>
                    {sectionLabelById.get(s.id) ?? `Section #${s.id}`}
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
                value={subjectId === "" ? String(selectedSubjectId || "") : String(subjectId)}
                onChange={(e) => onFilterChange({ subjectId: Number(e.target.value) })}
                disabled={subjects.isLoading || !subjects.data.length}
              >
                {(subjects.data ?? []).map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
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
                {EXAM_TYPES.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <FileDown className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {loading ? <LoadingState label="Loading marks..." /> : null}
        {!loading && q.error ? (
          <ErrorState title="Unable to load marks" message="Please try again." />
        ) : null}
        {!loading && !q.error && rows.length === 0 ? (
          <InsightState
            title="No marks found for selected filters"
            description="Try a different section, subject, or exam type to view performance insights. Once marks are available, this page will auto-populate detailed class and student metrics."
          />
        ) : null}

        {hasData ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">Average Score</div>
                <div className="mt-2 text-2xl font-extrabold text-blue-600">{totals.avgPct}%</div>
                <div className="text-xs text-gray-500">{totals.avgScore} marks avg</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">Pass Rate</div>
                <div className="mt-2 text-2xl font-extrabold text-green-600">{totals.passPct}%</div>
                <div className="text-xs text-gray-500">{totals.passCount}/{totals.total} students</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">Top Score</div>
                <div className="mt-2 text-2xl font-extrabold text-indigo-600">{totals.topScore}</div>
                <div className="text-xs text-gray-500">out of 100-scale equivalent</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-gray-500">Below Threshold</div>
                <div className="mt-2 text-2xl font-extrabold text-red-600">{totals.belowThreshold}</div>
                <div className="text-xs text-gray-500">needs improvement</div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">Class-wise Breakdown</div>
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
                    {classBreakdown.map((row) => (
                      <tr key={row.label}>
                        <td className="px-4 py-3 font-semibold text-gray-900">{row.label}</td>
                        <td className="px-4 py-3">{row.total}</td>
                        <td className="px-4 py-3 text-blue-600">{row.avgPct}%</td>
                        <td className="px-4 py-3 text-green-600">{row.pass}</td>
                        <td className="px-4 py-3 text-red-600">{row.fail}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-full max-w-[160px] rounded-full bg-gray-100">
                              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${row.avgPct}%` }} />
                            </div>
                            <div className="text-xs font-semibold text-gray-600">{row.avgPct}%</div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 text-xs text-gray-500">Showing {classBreakdown.length} classes</div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Student Results</div>
                    <div className="mt-1 text-xs text-gray-500">Search and open student profile or export current list.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by student or roll..."
                      className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={exportCsv}
                      className="h-10 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Roll</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Marks</th>
                      <th className="px-4 py-3">Percent</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rosterPagination.pagedItems.map((r) => {
                      const classLabel =
                        r.class_name && r.section_name
                          ? `${r.class_name} - ${r.section_name}`
                          : (r.section_id ? sectionLabelById.get(r.section_id) : undefined) ?? "—";
                      const percent = pct((r.marks_obtained / r.max_marks) * 100);
                      return (
                        <tr key={r.id}>
                          <td className="px-4 py-3">{r.roll_no ?? r.student_id}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/${navigateRole}/students/${r.student_id}`, {
                                  state: {
                                    breadcrumbLabel:
                                      r.student_name ?? "Student Profile",
                                  },
                                })
                              }
                              className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                            >
                              {r.student_name ?? `Student #${r.student_id}`}
                            </button>
                          </td>
                          <td className="px-4 py-3">{classLabel}</td>
                          <td className="px-4 py-3">{r.marks_obtained}/{r.max_marks}</td>
                          <td className="px-4 py-3">
                            <span
                              className={[
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                percent >= 75
                                  ? "bg-green-50 text-green-700"
                                  : percent >= 35
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700",
                              ].join(" ")}
                            >
                              {percent}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/${navigateRole}/students/${r.student_id}`, {
                                  state: {
                                    breadcrumbLabel:
                                      r.student_name ?? "Student Profile",
                                  },
                                })
                              }
                              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              Open Student
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={rosterPagination.page}
                pageSize={rosterPagination.pageSize}
                totalItems={rosterPagination.totalItems}
                totalPages={rosterPagination.totalPages}
                from={rosterPagination.from}
                to={rosterPagination.to}
                onPageChange={rosterPagination.setPage}
                onPageSizeChange={rosterPagination.setPageSize}
              />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
