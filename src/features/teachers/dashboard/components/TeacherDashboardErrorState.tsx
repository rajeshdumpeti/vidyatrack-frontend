import axios from "axios";

import { ErrorState } from "@/components/feedback/ErrorState";

type TeacherDashboardErrorStateProps = {
  error: unknown;
  onRetry: () => void;
};

export function TeacherDashboardErrorState({
  error,
  onRetry,
}: TeacherDashboardErrorStateProps) {
  const is404 = axios.isAxiosError(error) && error.response?.status === 404;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-2xl">
        <ErrorState
          title={is404 ? "No attendance section assigned" : "Dashboard unavailable"}
          message={
            is404
              ? "Please contact management to assign your attendance section."
              : "Unable to load data. Please try again."
          }
        />
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
