import { LogOut } from "lucide-react";

type SidebarAccountMenuProps = {
  collapsed: boolean;
  roleTitle: string;
  isOpen: boolean;
  onToggle: () => void;
  onLogout?: () => void;
};

export function SidebarAccountMenu({
  collapsed,
  roleTitle,
  isOpen,
  onToggle,
  onLogout,
}: SidebarAccountMenuProps) {
  return (
    <div className="border-t border-gray-100 p-3">
      <button
        type="button"
        onClick={onToggle}
        className={[
          "flex w-full items-center rounded-lg transition-colors duration-150 hover:bg-gray-50",
          collapsed ? "justify-center p-1" : "gap-3 p-2",
        ].join(" ")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
          PU
        </span>

        {!collapsed ? (
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-gray-800">
              Pilot User
            </p>
            <p className="truncate text-xs text-gray-500">{roleTitle}</p>
          </div>
        ) : null}
      </button>

      {/* Dropdown menu - shows above the button */}
      {isOpen ? (
        <div
          className={[
            "absolute z-10 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg",
            collapsed
              ? "bottom-full left-full mb-1 ml-1"
              : "bottom-full left-3 mb-1",
          ].join(" ")}
          role="menu"
        >
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600"
            role="menuitem"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
