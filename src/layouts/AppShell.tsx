import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { AppShellHardStops } from "./appShell/components/AppShellHardStops";
import { AppShellHeader } from "./appShell/components/AppShellHeader";
import { useAppShell } from "./appShell/hooks/useAppShell";

export function AppShell() {
  const shell = useAppShell();

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <AppShellHardStops
        hardStopReason={shell.hardStopReason}
        hardStopDetail={shell.hardStopDetail ?? null}
        shouldShowIdleModal={shell.shouldShowIdleModal}
        idleSecondsLeft={shell.idleSecondsLeft}
        onClearOffline={shell.onRetryOffline}
        onLogout={shell.onLogout}
        onRefresh={shell.onRefresh}
        onContactSupport={shell.onContactSupport}
        onStaySignedIn={shell.onStaySignedIn}
      />

      <div className="mx-auto h-full overflow-hidden bg-white shadow-lg md:rounded-2xl md:shadow-xl">
        <div className="mx-auto flex h-full w-full flex-col">
          <AppShellHeader
            role={shell.role}
            breadcrumbs={shell.breadcrumbs}
            showMenuButton={shell.role !== "teacher"}
            onOpenDrawer={shell.openDrawer}
            onLogout={shell.onLogout}
          />

          <div className="flex min-h-0 flex-1">
            {/* Desktop Sidebar - Only one source of truth */}
            {shell.role !== "teacher" ? (
              <div className="hidden h-full md:block">
                <Sidebar
                  role={shell.navItems.role}
                  items={shell.navItems.items}
                  collapsed={shell.isSidebarCollapsed}
                  onToggleCollapse={shell.toggleSidebarCollapse}
                  onLogout={shell.onLogout}
                />
              </div>
            ) : null}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {shell.isDrawerOpen ? (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-sm"
            onClick={shell.closeDrawer}
            aria-label="Close menu overlay"
          />

          {shell.role !== "teacher" ? (
            <div className="absolute left-0 top-0 h-full w-72 p-2">
              <Sidebar
                role={shell.navItems.role}
                items={shell.navItems.items}
                onClose={shell.closeDrawer}
                onLogout={shell.onLogout}
                showCollapseToggle={false}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
