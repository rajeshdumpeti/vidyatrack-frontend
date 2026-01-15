import { useState } from "react";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";

export function StudentsSetupPage() {
  // UI-only state (no API in this step)
  const [search, setSearch] = useState("");
  const [showLoading] = useState(false);
  const [showError] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Students
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Management setup: list + create (API wiring comes next).
          </p>
        </div>

        <button
          type="button"
          className="h-12 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          // no-op for now
          onClick={() => {}}
        >
          + Add Student
        </button>
      </div>

      {/* Top controls */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Search
            </label>
            <input
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name"
              inputMode="search"
            />
          </div>

          {/* Placeholder for Class/Section dropdowns (next step) */}
          <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm font-medium text-gray-500">
            Class/Section selectors will be added in the next step.
          </div>
        </div>
      </div>

      {/* Placeholder states */}
      {showLoading ? <LoadingState label="Loading students..." /> : null}

      {showError ? (
        <ErrorState
          title="Unable to load students"
          message="Please try again."
        />
      ) : null}

      {!showLoading && !showError ? (
        <div className="mt-6">
          <EmptyState message="No students yet. Create your first student." />
        </div>
      ) : null}
    </div>
  );
}
