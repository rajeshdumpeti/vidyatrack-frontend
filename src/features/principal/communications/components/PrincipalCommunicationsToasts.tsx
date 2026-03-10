import { TeacherCommunicationsToast } from "@/features/teachers/communications/components/TeacherCommunicationsToast";

type ToastState = "sending" | "sent" | null;

type PrincipalCommunicationsToastsProps = {
  homeworkToast: ToastState;
  parentToast: ToastState;
  dismissHomeworkToast: () => void;
  dismissParentToast: () => void;
};

export function PrincipalCommunicationsToasts({
  homeworkToast,
  parentToast,
  dismissHomeworkToast,
  dismissParentToast,
}: PrincipalCommunicationsToastsProps) {
  return (
    <>
      {homeworkToast ? (
        <TeacherCommunicationsToast
          state={homeworkToast}
          label={
            homeworkToast === "sending"
              ? "Sending homework to the class..."
              : "Homework sent successfully."
          }
          topClassName="top-6"
          onDismiss={dismissHomeworkToast}
        />
      ) : null}

      {parentToast ? (
        <TeacherCommunicationsToast
          state={parentToast}
          label={
            parentToast === "sending"
              ? "Sending message to parents..."
              : "Message sent successfully."
          }
          topClassName="top-20"
          onDismiss={dismissParentToast}
        />
      ) : null}
    </>
  );
}
