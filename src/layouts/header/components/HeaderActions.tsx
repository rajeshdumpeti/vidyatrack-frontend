import { Calendar, LogOut } from "lucide-react";

export function HeaderActions({
  today,
  onLogout,
}: {
  today: string;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-none items-center gap-2 md:gap-3">
      <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5">
        <Calendar className="h-3.5 w-3.5 text-gray-500" />
        <span className="hidden text-xs font-medium text-gray-700 sm:inline">
          {today}
        </span>
        <span className="text-xs font-medium text-gray-700 sm:hidden">
          {today}
        </span>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="group flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600"
      >
        <LogOut className="h-3.5 w-3.5 transition-colors group-hover:text-red-600" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
}
