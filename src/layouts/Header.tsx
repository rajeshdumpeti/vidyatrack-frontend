import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const today = useMemo(() => {
    // Local date, minimal formatting (pilot-safe)
    return new Date().toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }, []);

  const onLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 w-full items-center justify-between px-4">
        <div className="min-w-0 items-center gap-3 hidden sm:block">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-linear-to-br from-blue-500 via-indigo-500 to-purple-500 text-white hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300 md:hidden shadow-lg hover:shadow-xl"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          {/* 
          <div className="min-w-0">
            <div className="truncate text-base font-extrabold tracking-tight text-gray-900">
              {title}
            </div>
            <div className="truncate text-xs font-medium text-gray-500">
              VidyaTrack
            </div>
          </div> */}
        </div>

        <div className="flex flex-none items-center gap-3 text-xs font-semibold text-gray-600">
          <span className="hidden sm:inline">{today}</span>
          <span className="sm:hidden">{today}</span>
          <button
            type="button"
            onClick={onLogout}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
