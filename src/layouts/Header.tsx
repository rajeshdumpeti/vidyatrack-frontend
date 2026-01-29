import { useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { getHeaderTitle } from "./headerTitles";
import { useMemo } from "react";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const role = useAuthStore((s) => s.role);
  const isTeacher = role === "teacher";
  const title = useMemo(() => getHeaderTitle(pathname), [pathname]);

  const onLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Toggle button ONLY for Management/Principal */}
          {!isTeacher ? (
            <button
              onClick={onMenuClick}
              className="rounded-xl bg-gray-50 p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          ) : (
            /* Logo for Teachers since they have no Sidebar */
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          )}

          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">
              {title}
            </h1>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">
              {isTeacher ? "Teacher Portal" : "VidyaTrack"}
            </p>
          </div>
        </div>

        {/* Right Side Actions stay consistent */}
        <div className="flex items-center gap-4">
          <span className="hidden text-xs font-semibold text-gray-400 lg:block">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "short",
            })}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
