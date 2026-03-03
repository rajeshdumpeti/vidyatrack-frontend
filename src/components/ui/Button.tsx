import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type LoadingButtonProps = {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function variantClasses(variant: ButtonVariant): string {
  if (variant === "secondary") {
    return [
      "border border-gray-200 bg-white text-gray-700",
      "hover:bg-gray-50",
    ].join(" ");
  }
  return [
    "border border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 text-white",
    "hover:from-blue-700 hover:to-blue-800",
    "shadow-md shadow-blue-600/20",
  ].join(" ");
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  leftIcon,
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  const resolvedDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={resolvedDisabled}
      aria-busy={isLoading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all",
        "disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth ? "w-full" : "",
        variantClasses(variant),
        className,
      ].join(" ")}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {loadingText ?? "Loading..."}
        </>
      ) : (
        <>
          {leftIcon ? leftIcon : null}
          {children}
        </>
      )}
    </button>
  );
}
