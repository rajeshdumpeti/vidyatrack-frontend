import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, MessageCircle, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useMemo } from "react";
import type { NavRole } from "@/navigation/navConfig";
import { NAV_ITEMS } from "@/navigation/navConfig";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/utils/logger";
export function AppShell() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("vt_sidebar_collapsed") === "1";
  });
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed((prev) => !prev);
  const trace = useMemo(() => logger.traceId(), []);
  const role = useAuthStore((s) => s.role) as NavRole | null;
  const onLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  const navItems = useMemo(() => {
    if (
      role === "principal" ||
      role === "management" ||
      role === "super_admin"
    ) {
      return { role, items: NAV_ITEMS[role] };
    }

    logger.warn("[layout][nav] missing_or_unknown_role", { trace, role });
    return { role: undefined, items: [{ label: "Dashboard", to: "/" }] };
  }, [role, trace]);

  const crumbs = useMemo(() => {
    const pathname = location.pathname;
    const activeItem = navItems.items.find((item) => item.to === pathname);
    const roleLabel =
      role === "management"
        ? "Management"
        : role === "principal"
          ? "Principal"
          : role === "super_admin"
            ? "Platform"
            : "Teacher";

    if (activeItem) {
      return [roleLabel, activeItem.label];
    }

    const segments = pathname.split("/").filter(Boolean);
    if (!segments.length) return [roleLabel];
    const tail = segments[segments.length - 1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return [roleLabel, tail];
  }, [location.pathname, navItems.items, role]);
  // Escape closes drawer (mobile)
  useEffect(() => {
    if (!isDrawerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen]);

  useEffect(() => {
    localStorage.setItem(
      "vt_sidebar_collapsed",
      isSidebarCollapsed ? "1" : "0",
    );
  }, [isSidebarCollapsed]);

  return (
    <div className="h-screen overflow-hidden">
      <div className="mx-auto h-full overflow-hidden rounded-[1.75rem] bg-[#f6f8f7] shadow-[0_24px_50px_rgba(15,23,42,0.08)] md:rounded-[2rem]">
        <div className="mx-auto flex h-full w-full">
          {/* Desktop sidebar */}
          {role !== "teacher" && (
            <div className="hidden h-full md:block">
              <Sidebar
                role={navItems.role}
                items={navItems.items}
                collapsed={isSidebarCollapsed}
                onToggleCollapse={toggleSidebarCollapse}
                onLogout={onLogout}
              />{" "}
            </div>
          )}

          {/* Main content */}
          <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
            {role !== "teacher" ? (
              <div className="flex h-14 items-center justify-between border-b border-gray-200/70 bg-white/70 px-3 md:hidden">
                <button
                  type="button"
                  onClick={openDrawer}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            ) : null}
            <div className="hidden h-16 items-center justify-between border-b border-gray-200/80 bg-white/85 px-6 md:flex">
              <div className="truncate text-sm font-semibold text-gray-500">
                {crumbs.map((crumb, idx) => (
                  <span key={`${crumb}-${idx}`}>
                    <span
                      className={
                        idx === crumbs.length - 1 ? "text-gray-900" : ""
                      }
                    >
                      {crumb}
                    </span>
                    {idx < crumbs.length - 1 ? (
                      <span className="px-2 text-gray-300">›</span>
                    ) : null}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
                  aria-label="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
                  aria-label="Messages"
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                  <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
                  aria-label="Search"
                >
                  <Search className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
            <main className="flex-1 overflow-y-auto px-0">
              <Outlet />
            </main>
            {/* <Footer /> */}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isDrawerOpen ? (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay */}
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/25 backdrop-blur-[1px]"
            onClick={closeDrawer}
            aria-label="Close menu overlay"
          />

          {/* Drawer panel */}
          {role !== "teacher" && (
            <div className="absolute left-0 top-0 h-full w-72 p-2 shadow-xl">
              <Sidebar
                role={navItems.role}
                items={navItems.items}
                onClose={closeDrawer}
                onLogout={onLogout}
                showCollapseToggle={false}
              />{" "}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
