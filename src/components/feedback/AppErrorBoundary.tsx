import { AlertTriangle } from "lucide-react";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { HardStop } from "./HardStop";

export function AppErrorBoundary() {
  const error = useRouteError();
  let description = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    description = error.statusText || "Unable to load this page.";
  } else if (error instanceof Error) {
    description = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <HardStop
        tone="warning"
        icon={<AlertTriangle className="h-5 w-5" />}
        title="We hit a snag"
        description={description}
        primaryAction={{
          label: "Reload",
          onClick: () => window.location.reload(),
        }}
        secondaryAction={{
          label: "Back to Login",
          onClick: () => {
            window.location.href = "/auth/login";
          },
        }}
      />
      <div className="mt-6 text-center text-xs text-gray-400">
        <Link to="/" className="hover:text-gray-600">
          Return to home
        </Link>
      </div>
    </div>
  );
}
