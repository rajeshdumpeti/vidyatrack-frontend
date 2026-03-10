import { CheckCircle } from "lucide-react";

type TeacherCommunicationsToastProps = {
  state: "sending" | "sent";
  label: string;
  topClassName: string;
  onDismiss: () => void;
};

export function TeacherCommunicationsToast({
  state,
  label,
  topClassName,
  onDismiss,
}: TeacherCommunicationsToastProps) {
  return (
    <div className={`fixed inset-x-0 z-50 mx-auto w-full max-w-xl px-4 ${topClassName}`}>
      <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              {state === "sending" ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
            </div>
            {label}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full px-2 py-1 text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
