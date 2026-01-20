import { useMemo, useState } from "react";
import { logger } from "@/utils/logger";
import { usePrincipalStudents } from "@/hooks/usePrincipalStudents";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useSections } from "@/hooks/useSections";
import { useTeacherAttendanceSection } from "@/hooks/useTeacherAttendanceSection";
import { useStudentsBySection } from "@/hooks/useStudentsBySection";
import type { SectionDto } from "@/types/section.types";

export function StudentsListPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [sectionId, setSectionId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const sectionIdNumber = sectionId ? Number(sectionId) : undefined;
  const role = useAuthStore((s) => s.role);
  const isTeacher = role === "teacher";
  const sectionsList = useSections().list;
  const teacherSection = useTeacherAttendanceSection();
  const teacherSectionId = teacherSection.data?.section_id;
  const teacherStudents = useStudentsBySection(teacherSectionId);

  const q = usePrincipalStudents({ sectionId: sectionIdNumber, search });
  const navigate = useNavigate();
  const navigateRole = role ?? "teacher";

  const onFilterChange = (
    next: Partial<{ sectionId: string; search: string }>
  ) => {
    if (next.sectionId !== undefined) setSectionId(next.sectionId);
    if (next.search !== undefined) setSearch(next.search);

    logger.info("[students] filters_changed", {
      trace,
      sectionId: next.sectionId ?? sectionId,
      search: next.search ?? search,
    });
  };

  const sectionLabelById = useMemo(() => {
    const map = new Map<number, string>();
    (sectionsList.data ?? []).forEach((s: SectionDto) => {
      const classLabel = s.class_name ?? `Class #${s.class_id}`;
      map.set(s.id, `${classLabel} - ${s.name}`);
    });
    return map;
  }, [sectionsList.data]);

  const teacherFiltered = useMemo(() => {
    const list = teacherStudents.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s) => {
      const name = (s.name ?? "").toLowerCase();
      const roll = String(s.roll_no ?? "").toLowerCase();
      return name.includes(q) || roll.includes(q);
    });
  }, [teacherStudents.data, search]);

  const principalStudents = q.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="px-4 pt-6">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Student Directory
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            {isTeacher
              ? "Students in your attendance section."
              : "View and manage student records across all classes."}
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600">
                Search
              </label>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={search}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                placeholder="Search by name or admission number..."
                inputMode="search"
              />
            </div>
            {!isTeacher ? (
              <div className="min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-600">
                  All Classes
                </label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  value={sectionId}
                  onChange={(e) => onFilterChange({ sectionId: e.target.value })}
                  disabled={sectionsList.isLoading}
                >
                  <option value="">All Classes</option>
                  {(sectionsList.data ?? []).map((s: SectionDto) => {
                    const label =
                      sectionLabelById.get(s.id) ?? `Section ${s.id}`;
                    return (
                      <option key={s.id} value={s.id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {isTeacher
        ? teacherSection.isLoading || teacherStudents.isLoading
          ? <LoadingState label="Loading students..." />
          : null
        : q.isLoading
          ? <LoadingState label="Loading students..." />
          : null}

      {isTeacher ? (
        teacherSection.error || teacherStudents.error ? (
          <ErrorState
            title="Unable to load students"
            message="Please try again."
          />
        ) : null
      ) : q.error ? (
        <ErrorState
          title="Unable to load students"
          message="Please try again."
        />
      ) : null}

      {isTeacher && !teacherSection.isLoading && !teacherSectionId ? (
        <EmptyState message="No attendance section assigned yet." />
      ) : null}

      {isTeacher && teacherFiltered.length === 0 && teacherSectionId ? (
        <EmptyState message="No students found for your section." />
      ) : null}

      {!isTeacher && principalStudents.length === 0 ? (
        <EmptyState message="No students match the selected filters." />
      ) : null}

      {!isTeacher && principalStudents.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="text-sm font-semibold text-gray-900">
              Showing {principalStudents.length} Students
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Avatar</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {principalStudents.map((s) => {
                  const sectionLabel =
                    s.section_name && s.class_name
                      ? `${s.class_name} - ${s.section_name}`
                      : sectionLabelById.get(s.section_id) ??
                        `Section ${s.section_id}`;
                  const initials = (s.name ?? "?")
                    .trim()
                    .slice(0, 2)
                    .toUpperCase();
                  const contact = s.parent_phone ?? "—";
                  const studentCode = s.student_code ?? "—";
                  const guardianName = s.parent_name ?? "—";
                  const status = (s.status ?? "inactive").toLowerCase();
                  const statusLabel =
                    status === "active" ? "Active" : "Inactive";
                  const statusClasses =
                    status === "active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-600 border-gray-200";

                  return (
                    <tr key={s.id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                          {initials}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {s.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                        {studentCode}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {sectionLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {guardianName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {contact}
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
                            logger.info("[students] row_tap", {
                              trace,
                              studentId: s.id,
                            });
                            navigate(`/${navigateRole}/students/${s.id}`);
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

      {isTeacher && teacherFiltered.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="text-sm font-semibold text-gray-900">Results</div>
            <div className="mt-1 text-xs font-medium text-gray-500">
              Showing {teacherFiltered.length} Students
            </div>
          </div>

          <ul className="divide-y divide-gray-100">
            {teacherFiltered.map((s, idx) => {
              const roll =
                s.roll_no != null ? String(s.roll_no) : String(idx + 1);

              return (
                <li key={s.id} className="px-4 py-4">
                  <div className="flex w-full items-center justify-between gap-4 rounded-xl p-2 text-left">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 min-w-[44px] items-center justify-center rounded-lg bg-gray-100 px-2 text-sm font-bold text-gray-800">
                          {roll}
                        </span>
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {s.name}
                        </div>
                      </div>

                      {teacherSection.data ? (
                        <div className="mt-2 text-xs font-medium text-gray-500">
                          Section:{" "}
                          <span className="text-gray-900">
                            {teacherSection.data.class_name} -{" "}
                            {teacherSection.data.section_name}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
