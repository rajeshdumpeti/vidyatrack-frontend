import { ErrorState } from "@/components/feedback/ErrorState";

import { getTeacherSetupMessage } from "../helpers/teacherDashboardHelpers";
import type { TeacherSetupStatus } from "../types/teacherDashboard.types";

type TeacherDashboardSetupStateProps = {
  status: TeacherSetupStatus;
  recommendedNextAction: string | null | undefined;
  onRetry: () => void;
};

export function TeacherDashboardSetupState({
  status,
  recommendedNextAction,
  onRetry,
}: TeacherDashboardSetupStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-2xl">
        <ErrorState
          title="Teacher setup in progress"
          message={getTeacherSetupMessage(status)}
        />
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          {recommendedNextAction ??
            "Please contact management to complete setup."}
        </div>
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
