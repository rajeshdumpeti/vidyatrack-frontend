import { ClipboardList } from "lucide-react";

import type { HomeworkRecordDto } from "@/types/communications.types";

import { HomeworkComposerCard } from "./HomeworkComposerCard";
import { HomeworkTimelineCard } from "./HomeworkTimelineCard";

type HomeworkTabPanelProps = {
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
  timelineItems: HomeworkRecordDto[];
  historyLoading: boolean;
  historyError: unknown;
};

export function HomeworkTabPanel({
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
  timelineItems,
  historyLoading,
  historyError,
}: HomeworkTabPanelProps) {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Homework Broadcast</h2>
          <p className="text-sm text-gray-500">
            Send homework instructions to the entire class in one action.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HomeworkComposerCard
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          dueDate={dueDate}
          setDueDate={setDueDate}
          canSend={canSend}
          onSend={onSend}
          isPending={isPending}
          isError={isError}
        />
        <HomeworkTimelineCard
          timelineItems={timelineItems}
          historyLoading={historyLoading}
          historyError={historyError}
        />
      </div>
    </div>
  );
}
