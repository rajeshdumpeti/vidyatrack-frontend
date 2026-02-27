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
  const schoolId = useAuthStore((s) => s.schoolId);
  const schools = useAuthStore((s) => s.schools);
  const activeSchoolName =
    schools.find((s) => s.id === schoolId)?.name ?? null;

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
    <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden text-sm font-bold tracking-tight text-gray-900 md:inline">
            VidyaTrack
          </span>
          {activeSchoolName ? (
            <span className="hidden truncate rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 md:inline">
              {activeSchoolName}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-none items-center gap-2 text-xs font-semibold text-gray-600 md:gap-3">
          <span className="hidden sm:inline">{today}</span>
          <span className="sm:hidden">{today}</span>
          <button
            type="button"
            onClick={onLogout}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
