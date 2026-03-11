import { ErrorState } from "@/components/feedback/ErrorState";

type TeacherCommunicationsUnavailableStateProps = {
  title: string;
  message: string;
  onRetry: () => void;
};

export function TeacherCommunicationsUnavailableState({
  title,
  message,
  onRetry,
}: TeacherCommunicationsUnavailableStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-2xl">
        <ErrorState title={title} message={message} />
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
