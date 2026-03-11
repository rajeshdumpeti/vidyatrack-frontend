import { AlertCircle, CheckCircle, Search, Send } from "lucide-react";

import type { ParentStudent } from "../types/teacherCommunications.types";

type ParentMessageComposerCardProps = {
  parentSearch: string;
  setParentSearch: (value: string) => void;
  selectedParentIds: number[];
  filteredParents: ParentStudent[];
  onToggleParent: (id: number) => void;
  onSelectAll: () => void;
  onClear: () => void;
  subject: string;
  setSubject: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  isError: boolean;
  isSuccess: boolean;
  canSend: boolean;
  onSend: () => void;
  isPending: boolean;
};

export function ParentMessageComposerCard({
  parentSearch,
  setParentSearch,
  selectedParentIds,
  filteredParents,
  onToggleParent,
  onSelectAll,
  onClear,
  subject,
  setSubject,
  message,
  setMessage,
  isError,
  isSuccess,
  canSend,
  onSend,
  isPending,
}: ParentMessageComposerCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-base font-semibold text-gray-900">New Message</h3>
      <p className="mt-1 text-sm text-gray-500">
        Select recipients and craft your update.
      </p>

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={parentSearch}
              onChange={(event) => setParentSearch(event.target.value)}
              placeholder="Search student or parent..."
              className="w-56 bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
          <span className="text-xs text-gray-500">
            {selectedParentIds.length} selected
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-3">
            {filteredParents.map((student) => {
              const isSelected = selectedParentIds.includes(student.id);
              const contact = student.parent_phone ?? "No phone";

              return (
                <label
                  key={student.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                    isSelected
                      ? "border-blue-500 bg-white"
                      : "border-transparent bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleParent(student.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {student.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {student.parent_name
                        ? `${student.parent_name} • ${contact}`
                        : contact}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-400">
                    {student.roll_no ? `#${student.roll_no}` : ""}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Message Subject (optional)
          </label>
          <input
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-3 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="e.g., Upcoming quiz"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Message
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-3 h-28 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Write a short update for selected parents..."
          />
        </div>
      </div>

      {isError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Unable to send message. Please retry.
          </div>
        </div>
      ) : null}

      {isSuccess ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Parent message delivered successfully.
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Messages are sent to selected parents only.
        </span>
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend || isPending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {isPending ? "Sending..." : "Send Message"}
        </button>
      </div>
    </div>
  );
}
