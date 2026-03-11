type EnterMarksFooterActionsProps = {
  onSaveDraft: () => void;
  onSubmit: () => void;
  isDirty: boolean;
  isAutoSaving: boolean;
  isSubmitting: boolean;
  isContextLoading: boolean;
  filledMarks: number;
  hasValidExamType: boolean;
};

export function EnterMarksFooterActions({
  onSaveDraft,
  onSubmit,
  isDirty,
  isAutoSaving,
  isSubmitting,
  isContextLoading,
  filledMarks,
  hasValidExamType,
}: EnterMarksFooterActionsProps) {
  return (
    <div className="sticky bottom-0 z-10 mt-2 flex gap-3 border-t border-gray-200 bg-gray-50/95 px-0 py-3 backdrop-blur md:static md:mt-0 md:justify-end md:border-0 md:bg-transparent md:py-0">
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={!isDirty || isAutoSaving}
        className="h-12 flex-1 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-6"
      >
        {isAutoSaving ? "Saving..." : "Save Draft"}
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting || isContextLoading || filledMarks === 0 || !hasValidExamType}
        className="h-12 flex-[1.25] rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-8"
      >
        {isSubmitting ? "Submitting..." : "Submit Marks"}
      </button>
    </div>
  );
}
