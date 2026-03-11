import { History, Loader2 } from "lucide-react";

type EnterMarksStatusBannersProps = {
  isContextLoading: boolean;
  hasExistingMarks: boolean;
  existingMarksCount: number;
  hasSelectedAssignment: boolean;
};

export function EnterMarksStatusBanners({
  isContextLoading,
  hasExistingMarks,
  existingMarksCount,
  hasSelectedAssignment,
}: EnterMarksStatusBannersProps) {
  return (
    <>
      {isContextLoading && hasSelectedAssignment ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700">Loading exam context...</span>
        </div>
      ) : null}

      {hasExistingMarks && !isContextLoading ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
          <History className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            Found existing marks for {existingMarksCount} student(s)
          </span>
          <span className="text-sm text-blue-600">• You can update them below</span>
        </div>
      ) : null}
    </>
  );
}
