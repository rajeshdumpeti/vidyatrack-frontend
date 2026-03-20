import { MessageSquare } from "lucide-react";

import type { ParentMessageRecordDto } from "@/types/communications.types";

import type { ParentStudent } from "../types/teacherCommunications.types";
import { ParentMessageComposerCard } from "./ParentMessageComposerCard";
import { ParentMessagesTimelineCard } from "./ParentMessagesTimelineCard";

type ParentMessagesTabPanelProps = {
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
  timelineItems: ParentMessageRecordDto[];
  historyLoading: boolean;
  historyError: unknown;
};

export function ParentMessagesTabPanel({
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
  timelineItems,
  historyLoading,
  historyError,
}: ParentMessagesTabPanelProps) {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Parent Messaging</h2>
          <p className="text-sm text-gray-500">
            Send targeted updates to one or multiple parents in the class.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ParentMessageComposerCard
          parentSearch={parentSearch}
          setParentSearch={setParentSearch}
          selectedParentIds={selectedParentIds}
          filteredParents={filteredParents}
          onToggleParent={onToggleParent}
          onSelectAll={onSelectAll}
          onClear={onClear}
          subject={subject}
          setSubject={setSubject}
          message={message}
          setMessage={setMessage}
          isError={isError}
          isSuccess={isSuccess}
          canSend={canSend}
          onSend={onSend}
          isPending={isPending}
        />
        <ParentMessagesTimelineCard
          timelineItems={timelineItems}
          historyLoading={historyLoading}
          historyError={historyError}
        />
      </div>
    </div>
  );
}
