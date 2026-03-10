import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import type { NavItem, NavRole } from "@/navigation/navConfig";

import { SidebarAccountMenu } from "./sidebar/components/SidebarAccountMenu";
import { SidebarHeader } from "./sidebar/components/SidebarHeader";
import {
  getSidebarNavIcon,
  sidebarLinkBase,
  sidebarRoleTitleMap,
} from "./sidebar/helpers/sidebar.helpers";

export type SidebarProps = {
  role?: NavRole;
  items: NavItem[];
  onClose?: () => void;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
  collapsed?: boolean;
  showCollapseToggle?: boolean;
};

export function Sidebar({
  role,
  items,
  onClose,
  onToggleCollapse,
  onLogout,
  collapsed = false,
  showCollapseToggle = true,
}: SidebarProps) {
  const roleTitle = role ? sidebarRoleTitleMap[role] : "Menu";
  const linkBase =
    "flex h-11 items-center rounded-xl px-3 text-sm font-semibold";
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current) return;
      const target = event.target as Node;
      if (!accountMenuRef.current.contains(target)) {
        setIsAccountMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [isAccountMenuOpen]);

  return (
    <aside
      className={[
        "flex h-full flex-col bg-white border-r border-gray-200",
        collapsed ? "w-20" : "w-72",
        "transition-all duration-200 ease-in-out",
      ].join(" ")}
    >
      <SidebarHeader
        collapsed={collapsed}
        showCollapseToggle={showCollapseToggle}
        onToggleCollapse={onToggleCollapse}
        onClose={onClose}
      />

      <nav
        className={[
          "flex-1 overflow-y-auto py-3",
          collapsed ? "px-2" : "px-2",
        ].join(" ")}
      >
        <ul className="space-y-0.5">
          {items.map((item) => {
            const ItemIcon = getSidebarNavIcon(item.to);

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <span
                      className={[
                        sidebarLinkBase,
                        collapsed ? "justify-center px-0" : "",
                        isActive
                          ? `bg-gray-100 text-gray-900 font-medium`
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")}
                    >
                      <ItemIcon
                        className={[
                          "shrink-0",
                          collapsed ? "h-4 w-4" : "mr-3 h-4 w-4",
                          isActive ? "text-gray-900" : "text-gray-500",
                        ].join(" ")}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative" ref={accountMenuRef}>
        <SidebarAccountMenu
          collapsed={collapsed}
          roleTitle={roleTitle}
          isOpen={isAccountMenuOpen}
          onToggle={() => setIsAccountMenuOpen((prev) => !prev)}
          onLogout={onLogout}
        />
      </div>
    </aside>
  );
}
