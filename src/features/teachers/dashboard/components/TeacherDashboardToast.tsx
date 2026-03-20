type TeacherDashboardToastProps = {
  message: string;
  onDismiss: () => void;
};

export function TeacherDashboardToast({
  message,
  onDismiss,
}: TeacherDashboardToastProps) {
  return (
    <div className="mx-auto mb-4 w-full max-w-4xl px-4 pt-6">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
        <span>{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-green-900 hover:underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
