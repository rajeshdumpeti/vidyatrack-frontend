import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { useMemo } from "react";
import type { NavRole } from "@/navigation/navConfig";
import { NAV_ITEMS } from "@/navigation/navConfig";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/utils/logger";
export function AppShell() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const trace = useMemo(() => logger.traceId(), []);
  const role = useAuthStore((s) => s.role) as NavRole | null;

  const navItems = useMemo(() => {
    if (role === "teacher" || role === "principal" || role === "management") {
      return { role, items: NAV_ITEMS[role] };
    }

    logger.warn("[layout][nav] missing_or_unknown_role", { trace, role });
    return { role: undefined, items: [{ label: "Dashboard", to: "/" }] };
  }, [role, trace]);
  // Escape closes drawer (mobile)
  useEffect(() => {
    if (!isDrawerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={openDrawer} />

      <div className="mx-auto flex w-full ">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar role={navItems.role} items={navItems.items} />{" "}
        </div>

        {/* Main content */}
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col">
          <main className="flex-1 px-0">
            <Outlet />
          </main>
          <Footer />
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
            className="absolute inset-0 h-full w-full bg-black/30"
            onClick={closeDrawer}
            aria-label="Close menu overlay"
          />

          {/* Drawer panel */}
          <div className="absolute left-0 top-0 h-full w-72 shadow-xl">
            <Sidebar
              role={navItems.role}
              items={navItems.items}
              onClose={closeDrawer}
            />{" "}
          </div>
        </div>
      ) : null}
    </div>
  );
}
