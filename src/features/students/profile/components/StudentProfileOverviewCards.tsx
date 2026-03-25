import { EmptyState } from "@/components/feedback/EmptyState";
import { prettyExamType } from "@/utils/exams";
import type {
  StudentAttendanceSummary,
  StudentPersonalDetails,
} from "@/types/student.types";
import { ShieldUser, UserCircle2 } from "lucide-react";

import type { StudentRecentResultsGroup } from "../types/studentProfile.types";
import {
  formatDob,
  formatPercent,
  formatValue,
} from "../utils/studentProfile.utils";

export function StudentPersonalDetailsCard({
  personal,
}: {
  personal: StudentPersonalDetails | null;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-bold text-gray-900">
        <UserCircle2 className="mr-2 inline h-4 w-4 text-slate-600" />
        Personal Details
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700">
        <div>
          <div className="text-xs font-semibold text-gray-500">Date of Birth</div>
          <div className="mt-1 font-semibold text-gray-900">
            {formatDob(personal?.date_of_birth ?? null)}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500">Gender</div>
          <div className="mt-1 font-semibold text-gray-900">
            {formatValue(personal?.gender)}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500">Blood Group</div>
          <div className="mt-1 font-semibold text-gray-900">
            {formatValue(personal?.blood_group)}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500">Religion</div>
          <div className="mt-1 font-semibold text-gray-900">
            {formatValue(personal?.religion)}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500">Address</div>
          <div className="mt-1 font-semibold text-gray-900">
            {formatValue(personal?.address)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentAttendanceCard({
  attendance,
}: {
  attendance: StudentAttendanceSummary | null;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-gray-900">
          <ShieldUser className="mr-2 inline h-4 w-4 text-slate-600" />
          Attendance
        </div>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
          {formatPercent(attendance?.percentage)}
        </span>
      </div>
      <div className="mt-4 text-3xl font-extrabold text-gray-900">
        {formatPercent(attendance?.percentage)}
      </div>
      <div className="mt-1 text-sm text-gray-500">Year to Date</div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs font-semibold text-gray-500">Present Days</div>
          <div className="mt-1 text-base font-semibold text-gray-900">
            {formatValue(attendance?.present_days)}
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs font-semibold text-gray-500">Absent Days</div>
          <div className="mt-1 text-base font-semibold text-gray-900">
            {formatValue(attendance?.absent_days)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentRecentResultsCard({
  groupedRecentResults,
}: {
  groupedRecentResults: StudentRecentResultsGroup[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-bold text-gray-900">Recent Results</div>
      <div className="mt-4 space-y-3">
        {groupedRecentResults.length === 0 ? (
          <EmptyState message="No recent results." />
        ) : (
          groupedRecentResults.map((group, index) => (
            <div
              key={`${group.subject}-${index}`}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <div className="text-sm font-semibold text-gray-900">
                {formatValue(group.subject)}
              </div>
              <div className="mt-2 space-y-1.5">
                {group.exams.map((exam, examIndex) => (
                  <div
                    key={`${group.subject}-${exam.exam_type ?? "exam"}-${examIndex}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-2.5 py-2"
                  >
                    <span className="text-xs font-semibold text-gray-600">
                      {prettyExamType(exam.exam_type)}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {formatValue(exam.marks_obtained)}/{formatValue(exam.max_marks)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
