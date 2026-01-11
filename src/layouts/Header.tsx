import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getHeaderTitle } from "./headerTitles";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const { pathname } = useLocation();

  const title = useMemo(() => getHeaderTitle(pathname), [pathname]);

  const today = useMemo(() => {
    // Local date, minimal formatting (pilot-safe)
    return new Date().toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 w-full items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 md:hidden"
            aria-label="Open menu"
          >
            Menu
          </button>

          <div className="min-w-0">
            <div className="truncate text-base font-extrabold tracking-tight text-gray-900">
              {title}
            </div>
            <div className="truncate text-xs font-medium text-gray-500">
              VidyaTrack
            </div>
          </div>
        </div>

        <div className="flex flex-none items-center gap-3 text-xs font-semibold text-gray-600">
          <span className="hidden sm:inline">{today}</span>
          <span className="sm:hidden">{today}</span>
        </div>
      </div>
    </header>
  );
}
