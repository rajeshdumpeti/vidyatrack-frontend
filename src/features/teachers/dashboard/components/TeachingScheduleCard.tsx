import { BsCheckCircleFill } from "react-icons/bs";
import { IoTimeOutline } from "react-icons/io5";

import { LoadingState } from "@/components/feedback/LoadingState";
import type { TeachingAssignmentMeDto } from "@/types/teachingAssignment.types";

import { isActiveAssignment } from "../helpers/teacherDashboardHelpers";

type TeachingScheduleCardProps = {
  assignments: TeachingAssignmentMeDto[];
  activeAssignmentKey: string | null;
  isLoading: boolean;
  onSelect: (assignment: TeachingAssignmentMeDto) => void;
};

export function TeachingScheduleCard({
  assignments,
  activeAssignmentKey,
  isLoading,
  onSelect,
}: TeachingScheduleCardProps) {
  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <IoTimeOutline className="h-4 w-4" />
          Today's Schedule
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-10">
            <LoadingState label="Loading schedule..." />
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-10 text-center text-sm font-medium text-gray-500">
            No teaching assignments found.
          </div>
        ) : (
          assignments.map((assignment) => {
            const isActive = isActiveAssignment(
              activeAssignmentKey,
              assignment.section_id,
              assignment.subject_name,
            );

            return (
              <button
                key={`${assignment.section_id}-${assignment.subject_name}`}
                type="button"
                onClick={() => onSelect(assignment)}
                className={`w-full px-6 py-5 text-left transition-all ${isActive ? "bg-blue-50/60" : "hover:bg-gray-50"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={`text-[15px] font-bold ${isActive ? "text-blue-700" : "text-gray-900"}`}
                    >
                      {assignment.class_name} - {assignment.subject_name}
                    </div>
                    <div className="mt-1 text-xs font-medium text-gray-500">
                      Section {assignment.section_name} • Click to select
                    </div>
                  </div>
                  {isActive ? (
                    <BsCheckCircleFill className="h-5 w-5 text-blue-600" />
                  ) : (
                    <span className="text-blue-400 opacity-0 group-hover:opacity-100">
                      →
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
