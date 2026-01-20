import { useMemo, useState } from "react";
import { usePrincipalTeachers } from "@/hooks/usePrincipalTeachers";
import { logger } from "@/utils/logger";
import type { TeacherDto } from "@/types/teacher.types";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";

export function TeachersListPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
  const [expandedAssignments, setExpandedAssignments] = useState<
    Record<number, boolean>
  >({});
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const navigateRole = role ?? "teacher";

  const q = usePrincipalTeachers(search);
  const isManagement = role === "management";

  const allAssignments = useMemo(() => {
    const labels = new Set<string>();
    (q.data ?? []).forEach((t) => {
      (t.assignments ?? []).forEach((a) => {
        if (a.label) labels.add(a.label);
      });
    });
    return Array.from(labels).sort((a, b) => a.localeCompare(b));
  }, [q.data]);

  const filtered = useMemo(() => {
    const list = q.data ?? [];
    return list.filter((t) => {
      if (statusFilter !== "ALL") {
        const status = (t.status ?? "").toLowerCase();
        if (status !== statusFilter.toLowerCase()) return false;
      }
      if (subjectFilter !== "ALL") {
        const labels = (t.assignments ?? []).map((a) => a.label);
        if (!labels.includes(subjectFilter)) return false;
      }
      return true;
    });
  }, [q.data, statusFilter, subjectFilter]);

  const toggleAssignments = (teacherId: number) => {
    setExpandedAssignments((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="px-4 pt-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Teacher Directory
              </h1>
              <p className="mt-2 text-sm font-medium text-gray-600">
                Manage teaching staff access and assignments.
              </p>
            </div>
            {isManagement ? (
              <button
                type="button"
                className="h-10 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={() => navigate("/management/setup/teachers")}
              >
                + Add Teacher
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 space-y-5">
        {/* Search */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_0.7fr_0.7fr]">
            <div>
              <label className="block text-xs font-semibold text-gray-600">
                Search
              </label>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={search}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearch(v);
                  logger.info("[teachers] search_changed", {
                    trace,
                    length: v.length,
                  });
                }}
                placeholder="Search by name, ID or email"
                inputMode="search"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600">
                All Subjects
              </label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="ALL">All Subjects</option>
                {allAssignments.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600">
                All Statuses
              </label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {q.isLoading ? (
          <LoadingState label="Loading teachers..." />
        ) : null}

        {q.error ? (
          <ErrorState
            title="Unable to load teachers"
            message="Please retry."
          />
        ) : null}

        {!q.isLoading && !q.error && filtered.length === 0 ? (
          <EmptyState message="No teachers match the current filters." />
        ) : null}

        {!q.isLoading && !q.error && filtered.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">Results</div>
              <div className="mt-1 text-xs font-medium text-gray-500">
                Showing {filtered.length} Teachers
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Contact Info</th>
                    <th className="px-4 py-3">Assigned Classes</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(filtered as TeacherDto[]).map((t) => {
                    const name = t.name ?? `Teacher #${t.id}`;
                    const phone = t.phone ?? "—";
                    const email = t.email ?? "—";
                    const employeeId = t.employee_id ?? "—";
                    const assignments = t.assignments ?? [];
                    const isExpanded = !!expandedAssignments[t.id];
                    const visibleAssignments = isExpanded
                      ? assignments
                      : assignments.slice(0, 2);
                    const extraCount = Math.max(assignments.length - 2, 0);
                    const status = (t.status ?? "inactive").toLowerCase();
                    const statusLabel =
                      status === "active" ? "Active" : "Inactive";
                    const statusClasses =
                      status === "active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200";

                    return (
                      <tr key={t.id} className="align-top">
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {name}
                          </div>
                          {t.assigned_section_label ? (
                            <div className="mt-1 text-xs text-gray-500">
                              {t.assigned_section_label}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                          {employeeId}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          <div>{email}</div>
                          <div className="mt-1">{phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {visibleAssignments.map((a) => (
                              <span
                                key={`${t.id}-${a.label}`}
                                className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                              >
                                {a.label}
                              </span>
                            ))}
                            {!isExpanded && extraCount > 0 ? (
                              <button
                                type="button"
                                className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                                onClick={() => toggleAssignments(t.id)}
                              >
                                +{extraCount} more
                              </button>
                            ) : null}
                            {isExpanded && assignments.length > 2 ? (
                              <button
                                type="button"
                                className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                onClick={() => toggleAssignments(t.id)}
                              >
                                Show less
                              </button>
                            ) : null}
                            {assignments.length === 0 ? (
                              <span className="text-xs text-gray-400">—</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
                            onClick={() => {
                              logger.info("[teachers] row_tap", {
                                trace,
                                teacherId: t.id,
                              });
                              navigate(`/${navigateRole}/teachers/${t.id}`);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
