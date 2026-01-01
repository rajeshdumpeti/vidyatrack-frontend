import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

export function AppShell() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

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

      <div className="mx-auto flex w-full max-w-6xl">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
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
            <Sidebar onClose={closeDrawer} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
