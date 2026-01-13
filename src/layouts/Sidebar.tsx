import { NavLink } from "react-router-dom";
import type { NavItem, NavRole } from "../navigation/navConfig";

type SidebarProps = {
  role?: NavRole;
  items: NavItem[];
  onClose?: () => void;
};

const linkBase = "flex h-11 items-center rounded-xl px-3 text-sm font-semibold";

export function Sidebar({ role, items, onClose }: SidebarProps) {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="text-sm font-extrabold tracking-tight text-gray-900">
          {role ? `${role[0].toUpperCase()}${role.slice(1)} Menu` : "Menu"}
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            aria-label="Close menu"
          >
            Close
          </button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              [
                linkBase,
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-800 hover:bg-gray-50",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3 text-xs text-gray-500">
        Pilot navigation
      </div>
    </aside>
  );
}
