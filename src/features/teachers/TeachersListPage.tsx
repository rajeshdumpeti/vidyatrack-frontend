import { useMemo, useState } from "react";
import { usePrincipalTeachers } from "@/hooks/usePrincipalTeachers";
import { logger } from "@/utils/logger";
import type { TeacherDto } from "@/types/teacher.types";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

export function TeachersListPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [search, setSearch] = useState<string>("");
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const navigateRole = role ?? "teacher";

  const q = usePrincipalTeachers(search);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="px-4 pt-6">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Teachers
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Read-only operational lookup for Principal.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 space-y-5">
        {/* Search */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-900">
            Search (Name / Phone / Email)
          </label>
          <input
            className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              setSearch(v);
              logger.info("[principal][teachers] search_changed", {
                trace,
                length: v.length,
              });
            }}
            placeholder="Type teacher name, phone, or email"
            inputMode="search"
          />
        </div>

        {/* Results */}
        {!q.isLoading && !q.error && (q.data?.length ?? 0) > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">Results</div>
              <div className="mt-1 text-xs font-medium text-gray-500">
                Showing {q.data.length} Teachers
              </div>
            </div>

            <ul className="divide-y divide-gray-100">
              {(q.data as TeacherDto[]).map((t) => {
                const name = t.name ?? `Teacher #${t.id}`;
                const phone = t.phone ?? "—";
                const email = t.email ?? "—";
                const section = t.assigned_section_label ?? "";

                return (
                  <li key={t.id} className="px-4 py-4">
                    {/* Touch target >= 44px */}
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 rounded-xl p-2 text-left hover:bg-gray-50"
                      onClick={() => {
                        logger.info("[principal][teachers] row_tap", {
                          trace,
                          teacherId: t.id,
                        });
                        navigate(`/${navigateRole}/teachers/${t.id}`);
                      }}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {name}
                        </div>

                        <div className="mt-2 space-y-1 text-xs font-medium text-gray-500">
                          <div>
                            Phone:{" "}
                            <span className="text-gray-900">{phone}</span>
                          </div>
                          <div>
                            Email:{" "}
                            <span className="text-gray-900">{email}</span>
                          </div>
                          {section ? (
                            <div>
                              Assigned:{" "}
                              <span className="text-gray-900">{section}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <span className="inline-flex h-9 items-center rounded-full bg-gray-900 px-4 text-sm font-semibold text-white">
                        View
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </main>
    </div>
  );
}
