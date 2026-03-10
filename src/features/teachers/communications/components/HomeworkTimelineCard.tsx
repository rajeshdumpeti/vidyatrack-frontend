import type { HomeworkRecordDto } from "@/types/communications.types";

import { formatCommunicationsShortDate } from "../utils/teacherCommunications.utils";

type HomeworkTimelineCardProps = {
  timelineItems: HomeworkRecordDto[];
  historyLoading: boolean;
  historyError: unknown;
};

export function HomeworkTimelineCard({
  timelineItems,
  historyLoading,
  historyError,
}: HomeworkTimelineCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-base font-semibold text-gray-900">Homework Timeline</h3>
      <p className="mt-1 text-sm text-gray-500">
        Recently posted homework for this class.
      </p>

      {historyLoading ? (
        <div className="mt-6 text-sm text-gray-500">Loading homework history...</div>
      ) : historyError ? (
        <div className="mt-6 text-sm text-red-600">
          Unable to load homework history.
        </div>
      ) : timelineItems.length === 0 ? (
        <div className="mt-6 text-sm text-gray-500">No homework posted yet.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {timelineItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Due: {formatCommunicationsShortDate(item.due_date)}
                  </div>
                </div>
                <div className="text-xs font-semibold text-gray-500">
                  {formatCommunicationsShortDate(item.created_at)}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
