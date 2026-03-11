import { AlertCircle } from "lucide-react";

type EnterMarksConfirmationModalProps = {
  open: boolean;
  filledMarks: number;
  maxMarks: number;
  hasExistingMarks: boolean;
  existingMarksCount: number;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function EnterMarksConfirmationModal({
  open,
  filledMarks,
  maxMarks,
  hasExistingMarks,
  existingMarksCount,
  isSubmitting,
  onClose,
  onConfirm,
}: EnterMarksConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <AlertCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Finalize Marks Submission
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              You are about to submit marks for <strong>{filledMarks} students</strong>.
              <span className="mt-1 block">
                Maximum marks for this exam: <strong>{maxMarks}</strong>.
              </span>
              {hasExistingMarks ? (
                <span className="mt-1 block text-blue-600">
                  This will update {existingMarksCount} existing mark(s).
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="my-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">Important Notice</p>
              <p className="mt-1 text-xs text-amber-700">
                After submission, marks can be corrected for 7 days. After that,
                marks are locked and changes require admin approval.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Continue Editing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Yes, Submit Marks"}
          </button>
        </div>
      </div>
    </div>
  );
}
