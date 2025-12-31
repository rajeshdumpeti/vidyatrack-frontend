import { Component, type ReactNode } from "react";
import { ErrorState } from "./ErrorState";

export class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mx-auto w-full max-w-lg">
            <ErrorState
              title="Something went wrong"
              message="Please refresh the page and try again."
            />
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
