import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import type { NavItem, NavRole } from "@/navigation/navConfig";

type SidebarProps = {
  role?: NavRole;
  items: NavItem[];
  onClose?: () => void;
};

export function Sidebar({ items, onClose }: SidebarProps) {
  return (
    <aside className="flex h-full flex-col bg-white">
      {/* Sidebar Header */}
      <div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            {item.icon && <item.icon className="h-5 w-5" />}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-4 px-6 text-[10px] font-medium uppercase tracking-widest text-gray-400">
        v0.1.0-pilot
      </div>
    </aside>
  );
}
