import { useMemo, useState } from "react";
import { logger } from "../../utils/logger";
import { usePrincipalStudents } from "../../hooks/usePrincipalStudents";
import type { StudentDto } from "../../types/student.types";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

const MOCK_SECTIONS = [
  { id: "", label: "All Sections" },
  { id: "1", label: "Class 5 - Section A" },
  { id: "2", label: "Class 5 - Section B" },
  { id: "3", label: "Class 6 - Section A" },
];

const MOCK_STUDENTS: StudentDto[] = [
  {
    id: 101,
    name: "Aarav Kumar",
    section_id: 1,
    parent_phone: "9876543210",
    school_id: 1,
  },
  {
    id: 102,
    name: "Meera Shah",
    section_id: 2,
    parent_phone: "9876543211",
    school_id: 1,
  },
  {
    id: 103,
    name: "Ishaan Verma",
    section_id: 3,
    parent_phone: "9876543212",
    school_id: 1,
  },
  {
    id: 104,
    name: "Anaya Singh",
    section_id: 1,
    parent_phone: "9876543213",
    school_id: 1,
  },
];

export function StudentsListPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [sectionId, setSectionId] = useState<string>("ALL");
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

  const filteredMock = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = MOCK_STUDENTS.filter((s) =>
      sectionIdNumber ? s.section_id === sectionIdNumber : true
    );

    if (!q) return list;

    return list.filter((s) => {
      const name = (s.name ?? "").toLowerCase();
      const phone = (s.parent_phone ?? "").toLowerCase();
      const roll = String((s as any).roll_no ?? "").toLowerCase();
      return name.includes(q) || phone.includes(q) || roll.includes(q);
    });
  }, [search, sectionIdNumber]);

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
        </div>
      </main>

      {q.isLoading ? <LoadingState label="Loading students..." /> : null}

      {q.error ? (
        <ErrorState
          title="Unable to load students"
          message="Please try again."
        />
      ) : null}

      {filteredMock.length === 0 ? (
        <EmptyState message="No students match the selected filters." />
      ) : null}

      {filteredMock.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="text-sm font-semibold text-gray-900">Results</div>
            <div className="mt-1 text-xs font-medium text-gray-500">
              Showing {filteredMock.length} Students
            </div>
          </div>

          <ul className="divide-y divide-gray-100">
            {filteredMock.map((s) => {
              const roll = s.roll_no ?? String(s.id);
              const sectionLabel =
                MOCK_SECTIONS.find((x) => x.id === String(s.section_id))
                  ?.label ?? `Section ${s.section_id}`;

              return (
                <li key={s.id} className="px-4 py-4">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 rounded-xl p-2 text-left hover:bg-gray-50"
                    onClick={() => {
                      logger.info("[principal][students] row_tap", {
                        trace,
                        studentId: s.id,
                      });
                      navigate(`/${navigateRole}/students/${s.id}`);
                    }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 min-w-[44px] items-center justify-center rounded-lg bg-gray-100 px-2 text-sm font-bold text-gray-800">
                          {roll}
                        </span>
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {s.name}
                        </div>
                      </div>

                      <div className="mt-2 text-xs font-medium text-gray-500">
                        Section:{" "}
                        <span className="text-gray-900">{sectionLabel}</span> •
                        Parent:{" "}
                        <span className="text-gray-900">{s.parent_phone}</span>
                      </div>
                    </div>

                    <span className="text-sm font-semibold text-gray-700">
                      View
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
