import { FileText } from "lucide-react";

import type { StudentProfileDto } from "@/types/student.types";

import { formatValue, getStatusClasses } from "../utils/studentProfile.utils";

type StudentProfileHeaderCardProps = {
  student: StudentProfileDto;
  headerClassSection: string;
  isGeneratingReport: boolean;
  canGenerateReport: boolean;
  onGenerateReport: () => void;
};

export function StudentProfileHeaderCard({
  student,
  headerClassSection,
  isGeneratingReport,
  canGenerateReport,
  onGenerateReport,
}: StudentProfileHeaderCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-600">
            {student.name?.slice(0, 1) ?? "S"}
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">
              {formatValue(student.name)}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>Student Code: {formatValue(student.student_code)}</span>
              <span>•</span>
              <span>{headerClassSection}</span>
              <span>•</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                  student.status,
                )}`}
              >
                {formatValue(student.status)}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onGenerateReport}
          disabled={isGeneratingReport || !canGenerateReport}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <FileText className="h-4 w-4" />
          {isGeneratingReport ? "Generating..." : "Generate Report Card"}
        </button>
      </div>
    </div>
  );
}
