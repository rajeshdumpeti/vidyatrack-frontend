import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type ToastProps = {
  message: string;
  onClose?: () => void;
  variant?: ToastVariant;
};

const styleByVariant: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export function Toast({ message, onClose, variant = "info" }: ToastProps) {
  return (
    <div
      className={`fixed right-4 top-4 z-[70] w-[min(92vw,420px)] rounded-xl border px-4 py-3 shadow-lg ${styleByVariant[variant]}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {variant === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : variant === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p className="text-sm font-semibold">{message}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            className="text-xs font-semibold opacity-80 hover:opacity-100"
            onClick={onClose}
          >
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
