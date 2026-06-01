import { Link } from "react-router-dom";
import { Plus, RefreshCcw, SlidersHorizontal } from "lucide-react";

import { PlatformSchoolsListGrid } from "./schoolsList/components/PlatformSchoolsListGrid";
import { usePlatformSchoolsListPage } from "./schoolsList/hooks/usePlatformSchoolsListPage";
import type { SetupFilter, StatusFilter, SortBy } from "./schoolsList/hooks/usePlatformSchoolsListPage";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pilot", label: "Pilot" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const SETUP_OPTIONS: { value: SetupFilter; label: string }[] = [
  { value: "all", label: "All Schools" },
  { value: "complete", label: "Setup Complete" },
  { value: "incomplete", label: "Setup Incomplete" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "created_at", label: "Date Added" },
  { value: "name", label: "Name" },
  { value: "student_count", label: "Students" },
  { value: "last_active", label: "Last Active" },
];

export function PlatformSchoolsListPage() {
  const p = usePlatformSchoolsListPage();
  const { query, schools, summary, pagination } = p;
  const totalPages = pagination?.total_pages ?? 1;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
          {summary && (
            <p className="mt-0.5 text-sm text-gray-500">
              {summary.total} registered &bull;{" "}
              {summary.active} active
              {summary.setup_incomplete > 0 && (
                <span className="ml-1 font-medium text-amber-600">
                  &bull; {summary.setup_incomplete} incomplete setup
                </span>
              )}
            </p>
          )}
        </div>
        <Link
          to="/superadmin/schools/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-100 transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add School
        </Link>
      </div>

      {/* ── Filters row ── */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Search */}
        <input
          type="text"
          value={p.search}
          onChange={(e) => p.setSearch(e.target.value)}
          placeholder="Search by name or code…"
          className="flex-1 min-w-48 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        {/* Status */}
        <select
          value={p.statusFilter}
          onChange={(e) => p.handleFilterChange("status", e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Setup */}
        <select
          value={p.setupFilter}
          onChange={(e) => p.handleFilterChange("setup", e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400"
        >
          {SETUP_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
          <select
            value={p.sortBy}
            onChange={(e) => p.setSortBy(e.target.value as SortBy)}
            className="bg-transparent text-sm text-gray-700 outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => p.setSortOrder(p.sortOrder === "desc" ? "asc" : "desc")}
            className="ml-1 text-xs font-semibold text-gray-400 hover:text-gray-700"
          >
            {p.sortOrder === "desc" ? "↓" : "↑"}
          </button>
        </div>

        {/* Show test toggle */}
        <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 select-none">
          <input
            type="checkbox"
            checked={p.showTest}
            onChange={(e) => p.setShowTest(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
          />
          Show test schools
        </label>
      </div>

      {/* ── Content ── */}
      {query.isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-100 gap-3">
          <RefreshCcw className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 font-medium">Fetching schools…</p>
        </div>
      ) : query.isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-600">Could not load school list</p>
          <button
            onClick={() => query.refetch()}
            className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <PlatformSchoolsListGrid schools={schools} search={p.debouncedSearch} />
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Page {p.page} of {totalPages}
            {pagination && (
              <span className="ml-2 text-gray-400">({pagination.total} total)</span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => p.setPage((prev) => Math.max(1, prev - 1))}
              disabled={p.page <= 1}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => p.setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={p.page >= totalPages}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
