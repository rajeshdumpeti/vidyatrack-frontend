import { useMemo, useState } from "react";
import { useSubjects, useCreateSubject } from "../../../hooks/useSubjects";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { logger } from "../../../utils/logger";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function SubjectsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const { data, isLoading, error, refetch } = useSubjects();
  const createMutation = useCreateSubject();

  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;
    return data.filter((s) => normalize(s.name).includes(q));
  }, [data, search]);

  const openAdd = () => {
    setInlineError(null);
    setIsAdding(true);
    setName("");
    logger.info("[subjects] add opened", { trace });
  };

  const cancelAdd = () => {
    setInlineError(null);
    setIsAdding(false);
    setName("");
  };

  const submit = () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setInlineError("Subject name is required.");
      return;
    }
    if (trimmed.length < 2) {
      setInlineError("Enter at least 2 characters.");
      return;
    }

    setInlineError(null);

    createMutation.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          setIsAdding(false);
          setName("");
          logger.info("[subjects] create success", { trace, name: trimmed });
        },
        onError: (err) => {
          logger.warn("[subjects] create failed", { trace, err });
          setInlineError("Unable to create subject. Please try again.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <LoadingState label="Loading subjects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 space-y-3">
        <ErrorState title="Unable to load subjects" message="Please retry." />
        <button
          type="button"
          className="h-11 w-full rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900">
                Subjects
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Manage school subjects (read-only list + create).
              </div>
            </div>

            <button
              type="button"
              className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white disabled:opacity-60"
              onClick={openAdd}
              disabled={isAdding}
            >
              Add Subject
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-900">
              Search
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject name"
              type="text"
            />
          </div>

          {isAdding ? (
            <div className="mt-4 rounded-2xl border border-gray-200 p-4">
              <div className="text-sm font-extrabold text-gray-900">
                New subject
              </div>

              <label className="mt-3 block text-sm font-semibold text-gray-900">
                Subject name
              </label>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 disabled:opacity-60"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Mathematics"
                type="text"
                disabled={createMutation.isPending}
              />

              {inlineError ? (
                <div className="mt-3">
                  <ErrorState title="Unable to save" message={inlineError} />
                </div>
              ) : null}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white disabled:opacity-60"
                  onClick={submit}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Saving…" : "Save"}
                </button>

                <button
                  type="button"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-extrabold text-gray-900 disabled:opacity-60"
                  onClick={cancelAdd}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {filtered.length === 0 ? (
            <EmptyState message="Create a subject to get started." />
          ) : (
            <div className="space-y-2">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
                >
                  <div className="text-sm font-extrabold text-gray-900">
                    {s.name}
                  </div>
                  <div className="text-xs font-semibold text-gray-500">
                    ID: {s.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
