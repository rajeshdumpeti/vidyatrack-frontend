import { CheckCircle } from "lucide-react";

type EnterMarksCompletionStatusProps = {
  completionPercentage: number;
  hasExistingMarks: boolean;
  existingMarksCount: number;
  filledMarks: number;
  totalStudents: number;
};

export function EnterMarksCompletionStatus({
  completionPercentage,
  hasExistingMarks,
  existingMarksCount,
  filledMarks,
  totalStudents,
}: EnterMarksCompletionStatusProps) {
  if (completionPercentage !== 100) return null;

  return (
    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">All marks entered</span>
        </div>
        {hasExistingMarks ? (
          <span className="text-sm text-blue-600">
            Editing {existingMarksCount} existing mark(s)
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-green-700">
        {filledMarks} of {totalStudents} students have marks entered
      </p>
    </div>
  );
}
