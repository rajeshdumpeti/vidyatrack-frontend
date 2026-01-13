import { useMemo, useState } from "react";
import { logger } from "../../utils/logger";
import { usePrincipalStudents } from "../../hooks/usePrincipalStudents";
import type { StudentDto } from "../../types/student.types";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { Search, Users, User, Phone, ChevronRight } from "lucide-react";

const MOCK_SECTIONS = [
  { id: "", label: "All Sections" },
  { id: "1", label: "Class 5 - Section A" },
  { id: "2", label: "Class 5 - Section B" },
  { id: "3", label: "Class 6 - Section A" },
];

export function StudentsListPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [sectionId, setSectionId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const sectionIdNumber = sectionId ? Number(sectionId) : undefined;
  const q = usePrincipalStudents({ sectionId: sectionIdNumber, search });
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const navigateRole = role ?? "teacher";

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-12">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Student Directory
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Browse and manage all students in your institution
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {q.data?.length || 0} Students
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Card */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-white p-2 shadow-sm">
              <Search className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Find Students
              </h2>
              <p className="text-sm text-gray-600">
                Filter by section or search by name/roll number
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Section Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                Select Section
              </label>
              <div className="relative">
                <select
                  className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-gray-900 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={sectionId}
                  onChange={(e) =>
                    onFilterChange({ sectionId: e.target.value })
                  }
                >
                  {MOCK_SECTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronRight className="h-5 w-5 rotate-90 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Search className="h-4 w-4" />
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-sm font-medium text-gray-900 shadow-sm placeholder:text-gray-400 transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={search}
                  onChange={(e) => onFilterChange({ search: e.target.value })}
                  placeholder="Search by name or roll number..."
                  inputMode="search"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-6 flex items-center justify-between rounded-lg bg-white/60 px-4 py-3">
            <div className="text-sm text-gray-600">
              {search || sectionId !== "" ? (
                <>
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {q.data?.length || 0}
                  </span>{" "}
                  matching student{q.data?.length !== 1 ? "s" : ""}
                </>
              ) : (
                <>
                  Total of{" "}
                  <span className="font-semibold text-gray-900">
                    {q.data?.length || 0}
                  </span>{" "}
                  students
                </>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {q.isLoading && <LoadingState label="Loading student directory..." />}

        {/* Error State */}
        {q.error && (
          <ErrorState
            title="Unable to load students"
            message="Please check your connection and try again."
          />
        )}

        {/* Empty State */}
        {!q.isLoading && !q.error && (q.data?.length ?? 0) === 0 && (
          <EmptyState message="No students found matching your criteria" />
        )}

        {/* Student List */}
        {!q.isLoading && !q.error && (q.data?.length ?? 0) > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Student List
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {(q.data as StudentDto[]).map((s) => {
                const roll = s.roll_no ?? String(s.id);
                const sectionLabel =
                  MOCK_SECTIONS.find((x) => x.id === String(s.section_id))
                    ?.label ?? `Section ${s.section_id}`;

                return (
                  <div
                    key={s.id}
                    className="group transition-all hover:bg-blue-50/50"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-6 px-6 py-4 text-left cursor-pointer"
                      onClick={() => {
                        logger.info("[principal][students] row_tap", {
                          trace,
                          studentId: s.id,
                        });
                        navigate(`/${navigateRole}/students/${s.id}`);
                      }}
                    >
                      {/* Student Avatar and Basic Info */}
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 font-bold text-blue-700">
                          {roll}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">
                              {s.name}
                            </h4>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              ID: {s.id}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              <span className="font-medium">
                                {sectionLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              <span className="font-medium">
                                {s.parent_phone || "No contact"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* View Button */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-blue-600">
                          View Details
                        </span>
                        <ChevronRight className="h-5 w-5 text-blue-600 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
              <div className="text-center text-sm text-gray-600">
                Click on any student to view detailed information
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
