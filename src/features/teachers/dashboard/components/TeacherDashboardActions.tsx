import {
  BsCheckCircleFill,
  BsFillFileEarmarkTextFill,
  BsFillPencilFill,
} from "react-icons/bs";

import { TEACHER_DASHBOARD_ACTIONS } from "../constants/teacherDashboard.constants";
import type { TeacherDashboardAction } from "../types/teacherDashboard.types";

type TeacherDashboardActionsProps = {
  activeClassName: string | null;
  hasActiveAssignment: boolean;
  onAction: (route: string) => void;
};

function ActionIcon({ actionId }: { actionId: TeacherDashboardAction["id"] }) {
  if (actionId === "attendance") {
    return <BsCheckCircleFill className="h-5 w-5" />;
  }

  if (actionId === "marks") {
    return <BsFillFileEarmarkTextFill className="h-5 w-5" />;
  }

  return <BsFillPencilFill className="h-4 w-4" />;
}

export function TeacherDashboardActions({
  activeClassName,
  hasActiveAssignment,
  onAction,
}: TeacherDashboardActionsProps) {
  return (
    <div className="mt-10 space-y-4">
      {TEACHER_DASHBOARD_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={!hasActiveAssignment}
          onClick={() => onAction(action.route)}
          className={`flex w-full items-center justify-between rounded-2xl px-6 py-5 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] ${
            hasActiveAssignment
              ? "bg-[#2D54E8] hover:bg-[#2546C1]"
              : "cursor-not-allowed bg-gray-400 opacity-60"
          }`}
        >
          <span className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <ActionIcon actionId={action.id} />
            </div>
            {action.label} {activeClassName ? `(${activeClassName})` : ""}
          </span>
          <span className="text-xl">→</span>
        </button>
      ))}
    </div>
  );
}
