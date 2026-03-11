/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";

import { useHomeworkHistory } from "@/hooks/useHomeworkHistory";
import { useParentMessagesHistory } from "@/hooks/useParentMessagesHistory";
import { useSendHomework } from "@/hooks/useSendHomework";
import { useSendParentMessage } from "@/hooks/useSendParentMessage";
import type {
  HomeworkRecordDto,
  ParentMessageRecordDto,
} from "@/types/communications.types";

import {
  getFilteredParentStudents,
  getReversedHomeworkItems,
  getReversedParentMessageItems,
} from "../helpers/principalCommunications.helpers";
import type { PrincipalStudent } from "../types/principalCommunications.types";

type UsePrincipalCommunicationsDeliveryArgs = {
  sectionId: number | undefined;
  subjectId: number | undefined;
  parentStudents: PrincipalStudent[];
  resetKey: string;
};

export function usePrincipalCommunicationsDelivery({
  sectionId,
  subjectId,
  parentStudents,
  resetKey,
}: UsePrincipalCommunicationsDeliveryArgs) {
  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [homeworkDescription, setHomeworkDescription] = useState("");
  const [homeworkDueDate, setHomeworkDueDate] = useState("");
  const [homeworkToast, setHomeworkToast] = useState<"sending" | "sent" | null>(
    null,
  );

  const [parentSearch, setParentSearch] = useState("");
  const [selectedParentIds, setSelectedParentIds] = useState<number[]>([]);
  const [parentSubject, setParentSubject] = useState("");
  const [parentMessage, setParentMessage] = useState("");
  const [parentToast, setParentToast] = useState<"sending" | "sent" | null>(
    null,
  );

  const homeworkMutation = useSendHomework();
  const parentMessageMutation = useSendParentMessage();
  const homeworkHistory = useHomeworkHistory(sectionId, subjectId);
  const parentMessagesHistory = useParentMessagesHistory(sectionId);

  const filteredParents = useMemo(
    () => getFilteredParentStudents(parentStudents, parentSearch),
    [parentStudents, parentSearch],
  );

  useEffect(() => {
    setSelectedParentIds([]);
    setParentSearch("");
  }, [resetKey]);

  const homeworkItems = useMemo(
    () =>
      getReversedHomeworkItems((homeworkHistory.data ?? []) as HomeworkRecordDto[]),
    [homeworkHistory.data],
  );

  const parentMessageItems = useMemo(
    () =>
      getReversedParentMessageItems(
        (parentMessagesHistory.data ?? []) as ParentMessageRecordDto[],
      ),
    [parentMessagesHistory.data],
  );

  const canSendHomework =
    typeof sectionId === "number" &&
    typeof subjectId === "number" &&
    homeworkTitle.trim().length > 0 &&
    homeworkDescription.trim().length > 0;

  const canSendParentMessage =
    typeof sectionId === "number" &&
    selectedParentIds.length > 0 &&
    parentMessage.trim().length > 0;

  const sendHomework = () => {
    if (typeof sectionId !== "number" || typeof subjectId !== "number") return;
    setHomeworkToast("sending");
    homeworkMutation.mutate(
      {
        section_id: sectionId,
        subject_id: subjectId,
        title: homeworkTitle.trim(),
        description: homeworkDescription.trim(),
        due_date: homeworkDueDate ? homeworkDueDate : null,
      },
      {
        onSuccess: () => {
          homeworkHistory.refetch();
          setHomeworkToast("sent");
          setHomeworkTitle("");
          setHomeworkDescription("");
          setHomeworkDueDate("");
          window.setTimeout(() => {
            setHomeworkToast(null);
            homeworkMutation.reset();
          }, 2200);
        },
        onError: () => {
          setHomeworkToast(null);
          homeworkMutation.reset();
        },
      },
    );
  };

  const sendParentMessage = () => {
    if (typeof sectionId !== "number") return;
    setParentToast("sending");
    parentMessageMutation.mutate(
      {
        section_id: sectionId,
        student_ids: selectedParentIds,
        message: parentMessage.trim(),
        subject: parentSubject.trim() || null,
      },
      {
        onSuccess: () => {
          parentMessagesHistory.refetch();
          setParentToast("sent");
          setParentSubject("");
          setParentMessage("");
          setSelectedParentIds([]);
          window.setTimeout(() => {
            setParentToast(null);
            parentMessageMutation.reset();
          }, 2200);
        },
        onError: () => {
          setParentToast(null);
          parentMessageMutation.reset();
        },
      },
    );
  };

  return {
    homeworkTitle,
    setHomeworkTitle,
    homeworkDescription,
    setHomeworkDescription,
    homeworkDueDate,
    setHomeworkDueDate,
    homeworkToast,
    dismissHomeworkToast: () => setHomeworkToast(null),
    canSendHomework,
    sendHomework,
    homeworkPending: homeworkMutation.isPending,
    homeworkError: homeworkMutation.isError,
    homeworkItems,
    homeworkHistoryLoading: homeworkHistory.isLoading,
    homeworkHistoryError: homeworkHistory.error,
    parentSearch,
    setParentSearch,
    selectedParentIds,
    filteredParents,
    toggleParent: (id: number) => {
      setSelectedParentIds((prev) =>
        prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
      );
    },
    selectAllParents: () => {
      setSelectedParentIds(filteredParents.map((student) => student.id));
    },
    clearParentSelection: () => {
      setSelectedParentIds([]);
    },
    parentSubject,
    setParentSubject,
    parentMessage,
    setParentMessage,
    parentToast,
    dismissParentToast: () => setParentToast(null),
    canSendParentMessage,
    sendParentMessage,
    parentMessagePending: parentMessageMutation.isPending,
    parentMessageError: parentMessageMutation.isError,
    parentMessageSuccess: parentMessageMutation.isSuccess,
    parentMessageItems,
    parentMessagesHistoryLoading: parentMessagesHistory.isLoading,
    parentMessagesHistoryError: parentMessagesHistory.error,
    resetForContextChange: () => {},
  };
}
