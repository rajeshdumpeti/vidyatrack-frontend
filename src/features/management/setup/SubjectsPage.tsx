import { useMemo, useState } from "react";
import {
  HiOutlineBookOpen,
  HiOutlinePlusCircle,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlinePlus,
} from "react-icons/hi";

import { useSubjects, useCreateSubject } from "@/hooks/useSubjects";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { logger } from "@/utils/logger";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function SubjectsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const { data, isLoading, error, refetch, schoolId } = useSubjects();
  const createMutation = useCreateSubject();

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;
    return data.filter((s) => normalize(s.name).includes(q));
  }, [data, search]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
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
          setName("");
          logger.info("[subjects] create success", { trace, name: trimmed });
        },
        onError: (err) => {
          logger.warn("[subjects] create failed", { trace, err });
          setInlineError("Unable to create subject. Please try again.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <LoadingState label="Loading subject repository..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
        <ErrorState
          title="Connection Error"
          message="Unable to load subjects from the server."
        />
        <button
          type="button"
          className="mt-6 h-12 px-8 rounded-2xl bg-[#0f172a] text-sm font-bold text-white transition-all hover:bg-black"
          onClick={() => refetch()}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#f8fafc] min-h-screen">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <HiOutlineBookOpen size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e293b]">
            Subject Repository
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage the master list of subjects for School ID:{" "}
            <span className="text-indigo-600 font-bold">{schoolId}</span>
          </p>
        </div>
      </div>

      {/* Horizontal Quick Add Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm transition-all hover:border-slate-300">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Quick Add: New Subject
        </div>
        <form
          onSubmit={submit}
          className="flex flex-col md:flex-row items-center gap-4"
        >
          <div className="relative flex-1 w-full">
            <HiOutlinePlusCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (inlineError) setInlineError(null);
              }}
              placeholder="e.g. Advanced Mathematics"
              className={`w-full h-14 pl-12 pr-4 rounded-2xl border ${
                inlineError
                  ? "border-red-200 bg-red-50"
                  : "border-slate-100 bg-slate-50/50"
              } text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400`}
              disabled={createMutation.isPending}
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !name.trim()}
            className="w-full md:w-auto h-14 px-10 bg-[#0f172a] hover:bg-black text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                <HiOutlinePlus /> Add Subject
              </>
            )}
          </button>
        </form>
        {inlineError && (
          <p className="text-xs text-red-500 mt-2 font-bold px-1">
            {inlineError}
          </p>
        )}
      </div>

      {/* Main List Section */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {/* List Filtering Header */}
        <div className="px-8 py-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Registered Subjects ({filtered.length})
          </span>
          <div className="relative w-full md:w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter subjects by name..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                <HiOutlineBookOpen size={40} />
              </div>
              <h3 className="text-slate-800 font-bold mb-1">
                No subjects found
              </h3>
              <p className="text-slate-400 text-sm max-w-[250px]">
                {search
                  ? "Try adjusting your search filters."
                  : "Start by adding your first school subject above."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="group p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/40 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      {s.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm">
                        {s.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                        Ref ID: VT-{s.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all rounded-lg hover:bg-red-50">
                      <HiOutlineTrash size={18} />
                    </button>
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
