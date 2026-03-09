import type { ReactNode } from "react";

export type HardStopAction = {
  label: string;
  onClick: () => void;
};

export type HardStopTone = "info" | "warning" | "danger";

const toneStyles: Record<HardStopTone, {
  ring: string;
  icon: string;
  button: string;
}> = {
  info: {
    ring: "ring-blue-100",
    icon: "bg-blue-50 text-blue-700",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  warning: {
    ring: "ring-amber-100",
    icon: "bg-amber-50 text-amber-700",
    button: "bg-amber-600 hover:bg-amber-700",
  },
  danger: {
    ring: "ring-red-100",
    icon: "bg-red-50 text-red-700",
    button: "bg-red-600 hover:bg-red-700",
  },
};

export type HardStopProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  primaryAction?: HardStopAction;
  secondaryAction?: HardStopAction;
  tone?: HardStopTone;
};

export function HardStop({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tone = "info",
}: HardStopProps) {
  const styles = toneStyles[tone];

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-200">
      <div className="flex flex-col items-center text-center">
        {icon ? (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${styles.icon} ring-1 ${styles.ring}`}
          >
            {icon}
          </div>
        ) : null}
        <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {primaryAction ? (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className={`h-11 rounded-xl px-5 text-sm font-semibold text-white ${styles.button}`}
            >
              {primaryAction.label}
            </button>
          ) : null}
          {secondaryAction ? (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {secondaryAction.label}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
