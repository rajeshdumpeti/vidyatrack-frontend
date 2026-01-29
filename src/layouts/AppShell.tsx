import { useEffect, useState, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { NAV_ITEMS, type NavRole } from "@/navigation/navConfig";
import { useAuthStore } from "@/store/auth.store";

export function AppShell() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const role = useAuthStore((s) => s.role) as NavRole | null;

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  // Simplified navigation logic
  const navConfig = useMemo(() => {
    if (role && NAV_ITEMS[role]) {
      return { role, items: NAV_ITEMS[role] };
    }
    return { role: undefined, items: [] };
  }, [role]);

  // Global "Esc" listener for better UX
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    if (isDrawerOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isDrawerOpen]);

  // Shared Sidebar Component to avoid repeating props
  const renderSidebar = (isMobile = false) => (
    <Sidebar
      role={navConfig.role}
      items={navConfig.items}
      onClose={isMobile ? closeDrawer : undefined}
    />
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header onMenuClick={openDrawer} />

      <div className="flex flex-1">
        {/* Desktop Sidebar - Hidden for teachers based on your logic */}
        {role && role !== "teacher" && (
          <aside className="hidden border-r border-gray-200 bg-white sm:block md:w-64 lg:w-72">
            {renderSidebar()}
          </aside>
        )}

        <div className="flex flex-1 flex-col">
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && role && role !== "teacher" && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={closeDrawer}
          />
          {/* Panel */}
          <div className="absolute inset-y-0 left-0 w-full max-w-xs bg-white shadow-2xl transition-transform">
            {renderSidebar(true)}
          </div>
        </div>
      )}
    </div>
  );
}
