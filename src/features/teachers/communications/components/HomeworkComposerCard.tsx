import { AlertCircle, Calendar, Send } from "lucide-react";

type HomeworkComposerCardProps = {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  canSend: boolean;
  onSend: () => void;
  isPending: boolean;
  isError: boolean;
};

export function HomeworkComposerCard({
  title,
  setTitle,
  description,
  setDescription,
  dueDate,
  setDueDate,
  canSend,
  onSend,
  isPending,
  isError,
}: HomeworkComposerCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-base font-semibold text-gray-900">New Homework</h3>
      <p className="mt-1 text-sm text-gray-500">
        Provide clear instructions for the class.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Homework Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-3 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="e.g., Chapter 5 worksheet"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Due Date
          </label>
          <div className="mt-3 flex items-center gap-3 rounded-xl">
            <Calendar className="h-5 w-5 text-blue-600" />
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Details
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-3 h-32 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Provide steps, references, or submission rules."
          />
        </div>
      </div>

      {isError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Unable to send homework. Please retry.
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Visible to all students in this class.
        </span>
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend || isPending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {isPending ? "Sending..." : "Send Homework"}
        </button>
      </div>
    </div>
  );
}
