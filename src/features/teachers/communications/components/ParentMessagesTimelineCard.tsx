import type { ParentMessageRecordDto } from "@/types/communications.types";

import {
  formatCommunicationsShortDate,
  getParentMessageBody,
} from "../utils/teacherCommunications.utils";

type ParentMessagesTimelineCardProps = {
  timelineItems: ParentMessageRecordDto[];
  historyLoading: boolean;
  historyError: unknown;
};

export function ParentMessagesTimelineCard({
  timelineItems,
  historyLoading,
  historyError,
}: ParentMessagesTimelineCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-base font-semibold text-gray-900">Message Timeline</h3>
      <p className="mt-1 text-sm text-gray-500">Recent messages sent to parents.</p>

      {historyLoading ? (
        <div className="mt-6 text-sm text-gray-500">Loading message history...</div>
      ) : historyError ? (
        <div className="mt-6 text-sm text-red-600">
          Unable to load message history.
        </div>
      ) : timelineItems.length === 0 ? (
        <div className="mt-6 text-sm text-gray-500">No parent messages sent yet.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {timelineItems.map((item) => {
            const recipients = item.student_ids?.length ?? 0;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {item.subject || "Parent update"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Sent to {recipients} parent{recipients === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-500">
                    {formatCommunicationsShortDate(item.created_at)}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                  {getParentMessageBody(item) || "—"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
