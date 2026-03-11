import { Plus, Shapes } from "lucide-react";

type SubjectsCreateFormProps = {
  name: string;
  setName: (value: string) => void;
  inlineError: string | null;
  clearInlineError: () => void;
  onSubmit: (event?: React.FormEvent) => void;
  isPending: boolean;
};

export function SubjectsCreateForm({
  name,
  setName,
  inlineError,
  clearInlineError,
  onSubmit,
  isPending,
}: SubjectsCreateFormProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]"
      >
        <div className="relative">
          <Shapes className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (inlineError) clearInlineError();
            }}
            placeholder="Add subject (e.g. Environmental Science)"
            className={`h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
              inlineError ? "border-red-300" : "border-slate-200"
            }`}
            disabled={isPending}
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {isPending ? "Saving..." : "Add Subject"}
        </button>
      </form>
      {inlineError ? (
        <p className="mt-2 text-xs font-semibold text-red-600">{inlineError}</p>
      ) : null}
    </section>
  );
}
