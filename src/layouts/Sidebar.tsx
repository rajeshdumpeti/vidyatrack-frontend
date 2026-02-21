import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  BookOpenText,
  Building2,
  CalendarClock,
  CirclePlus,
  ClipboardList,
  GraduationCap,
  House,
  LayoutGrid,
  LogOut,
  NotebookPen,
  UserCog,
  Users,
  X,
} from "lucide-react";
import type { NavItem, NavRole } from "@/navigation/navConfig";

type SidebarProps = {
  role?: NavRole;
  items: NavItem[];
  onClose?: () => void;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
  collapsed?: boolean;
  showCollapseToggle?: boolean;
};

const linkBase = "flex h-11 items-center rounded-xl px-3 text-sm font-semibold";
const roleTitleMap: Record<NavRole, string> = {
  management: "Management",
  principal: "Principal",
  teacher: "Teacher",
  super_admin: "Platform",
};

function navIcon(to: string) {
  if (to === "/management" || to === "/principal" || to === "/platform")
    return House;
  if (to.includes("/setup/academic")) return LayoutGrid;
  if (to.includes("/setup/subjects")) return BookOpenText;
  if (to.includes("/setup/assign-subjects")) return ClipboardList;
  if (to.includes("/setup/teachers")) return UserCog;
  if (to.includes("/students")) return Users;
  if (to.includes("/teachers")) return UserCog;
  if (to.includes("/attendance")) return CalendarClock;
  if (to.includes("/marks")) return GraduationCap;
  if (to.includes("/notes")) return NotebookPen;
  if (to.includes("/platform/schools/new")) return CirclePlus;
  if (to.includes("/platform/schools")) return Building2;
  return House;
}

export function Sidebar({
  role,
  items,
  onClose,
  onToggleCollapse,
  onLogout,
  collapsed = false,
  showCollapseToggle = true,
}: SidebarProps) {
  const roleTitle = role ? roleTitleMap[role] : "Menu";
  const initials = roleTitle.slice(0, 2).toUpperCase();
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
        "flex h-full flex-col overflow-hidden rounded-r-[2rem] border-r border-gray-200/80 bg-[#eef3f1] text-gray-800 md:rounded-3xl md:border md:border-white/70 md:shadow-[0_10px_28px_rgba(15,23,42,0.08)]",
        collapsed ? "w-20" : "w-72",
      ].join(" ")}
    >
      <div className={collapsed ? "px-3 pb-3 pt-5" : "px-4 pb-3 pt-5"}>
        <div className="flex items-center justify-between">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-xs font-bold text-white">
            VT
          </span>

          {showCollapseToggle && onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300/80 bg-white text-gray-600 hover:bg-gray-50"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          ) : null}

          {!showCollapseToggle && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300/80 bg-white text-gray-600 hover:bg-gray-50"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        {!collapsed ? (
          <>
            <p className="mt-5 text-[1.75rem] font-bold leading-none tracking-tight text-gray-900">
              {roleTitle}
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
              Main Menu
            </p>
          </>
        ) : null}
      </div>

      <nav
        className={[
          "flex flex-1 flex-col gap-1.5 overflow-y-auto pb-3",
          collapsed ? "px-2" : "px-3",
        ].join(" ")}
      >
        {items.map((item) => {
          const isRoot =
            item.to === "/" || (role && item.to === `/${role}`);
          const ItemIcon = navIcon(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={isRoot}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <span
                  className={
                    [
                      "group relative",
                      linkBase,
                      collapsed ? "justify-center px-0" : "",
                      isActive
                        ? "bg-white text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.08)]"
                        : "text-gray-700 hover:bg-white/75 hover:text-gray-900",
                    ].join(" ")
                  }
                >
                  {isActive ? (
                    <span
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gray-900"
                      aria-hidden="true"
                    />
                  ) : null}
                  <ItemIcon className={collapsed ? "h-4 w-4 shrink-0" : "mr-2.5 h-4 w-4 shrink-0"} />
                  {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
                  {collapsed ? (
                    <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:block">
                      {item.label}
                    </span>
                  ) : null}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className={collapsed ? "border-t border-gray-300/60 p-2" : "border-t border-gray-300/60 p-3"}>
        {!collapsed ? (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
              Account
            </p>
            <div className="relative mt-2" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-white/80 bg-white/65 p-2.5 text-left hover:bg-white"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">Pilot User</p>
                  <p className="truncate text-xs font-medium text-gray-500">{roleTitle}</p>
                </div>
              </button>
              {isAccountMenuOpen ? (
                <div
                  className="absolute bottom-[calc(100%+0.5rem)] left-0 z-30 w-full rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/80 bg-white/65 text-sm font-bold text-gray-700 hover:bg-white"
              aria-label="Account menu"
              title="Account menu"
              aria-haspopup="menu"
              aria-expanded={isAccountMenuOpen}
            >
              {initials}
            </button>
            {isAccountMenuOpen ? (
              <div
                className="absolute bottom-[calc(100%+0.5rem)] left-full z-30 ml-2 w-40 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
                role="menu"
              >
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}
