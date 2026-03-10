import { ChevronLeft, ChevronRight, X } from "lucide-react";

type SidebarHeaderProps = {
  collapsed: boolean;
  showCollapseToggle: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
};

export function SidebarHeader({
  collapsed,
  showCollapseToggle,
  onToggleCollapse,
  onClose,
}: SidebarHeaderProps) {
  return (
    <div className="border-b border-gray-100">
      <div className={collapsed ? "px-3 py-4" : "px-2 py-2"}>
        <div className="flex items-center justify-between">
          {/* When collapsed - show VT */}
          {collapsed ? (
            <div className="flex w-full justify-center">
              <span className="text-lg font-bold text-gray-800">VT</span>
            </div>
          ) : (
            /* When expanded - show nothing (brand is in header) */
            <div className="w-8" /> // Empty spacer for alignment
          )}

          {/* Toggle button */}
          {showCollapseToggle && onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </button>
          ) : !showCollapseToggle && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
