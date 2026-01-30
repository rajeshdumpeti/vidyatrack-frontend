type AttendanceSubmitModalProps = {
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: boolean;
  sectionLabel?: string;
  redirectCountdown: number;
  onSubmit: () => void;
  onClose: () => void;
  onReturnHome: () => void;
};

export function AttendanceSubmitModal({
  isSubmitting,
  submitSuccess,
  submitError,
  sectionLabel,
  redirectCountdown,
  onSubmit,
  onClose,
  onReturnHome,
}: AttendanceSubmitModalProps) {
  if (!isSubmitting && !submitSuccess && !submitError) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        {isSubmitting ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
            <div className="mt-4 text-lg font-extrabold text-gray-900">
              Saving attendance...
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Please wait while we update records.
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500" />
            </div>
          </>
        ) : null}

        {!isSubmitting && submitSuccess ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div className="mt-4 text-lg font-extrabold text-gray-900">
              Attendance Saved!
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {sectionLabel
                ? `${sectionLabel} records updated.`
                : "Records updated."}
            </div>
            <div className="mt-4 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600">
              Returning to dashboard... {redirectCountdown || 0}s
            </div>
            <button
              type="button"
              className="mt-4 h-11 w-full rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
              onClick={onReturnHome}
            >
              Return Home Now
            </button>
            <div className="mt-3 text-xs text-gray-500">
              Need changes? You can edit this record later.
            </div>
          </>
        ) : null}

        {!isSubmitting && !submitSuccess && submitError ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 8v5" />
                <path d="M12 16h.01" />
                <path d="M10.29 3.86l-7.4 12.82A2 2 0 004.6 20h14.8a2 2 0 001.71-3.32l-7.4-12.82a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="mt-4 text-lg font-extrabold text-gray-900">
              Submit failed
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Please retry. Your selections are saved and not lost.
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="h-11 w-full rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={onSubmit}
              >
                Retry
              </button>
              <button
                type="button"
                className="h-11 w-full rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
