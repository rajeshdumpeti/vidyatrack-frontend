import { Building2, Menu } from "lucide-react";

export function HeaderBrand({
  activeSchoolName,
  onMenuClick,
}: {
  activeSchoolName: string | null;
  onMenuClick: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-b from-blue-600 to-blue-700 shadow-sm">
          <span className="text-xs font-bold text-white">VT</span>
        </div>
        <span className="hidden text-sm font-semibold tracking-tight text-gray-900 md:inline">
          VidyaTrack
        </span>
      </div>

      {activeSchoolName ? (
        <div className="hidden items-center gap-1 rounded-md bg-blue-50 px-2 py-1 md:flex">
          <Building2 className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">
            {activeSchoolName}
          </span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}
