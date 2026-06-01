import { Link } from "react-router-dom";
import { Menu, LogOut, ChevronRight, Home, User } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type AppShellHeaderProps = {
  role?: string | null;
  breadcrumbs: BreadcrumbItem[];
  showMenuButton: boolean;
  profilePath?: string | null;
  onOpenDrawer: () => void;
  onLogout: () => void;
};

export function AppShellHeader({
  role,
  breadcrumbs,
  showMenuButton,
  profilePath,
  onOpenDrawer,
  onLogout,
}: AppShellHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Left section */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu button */}
        {showMenuButton ? (
          <button
            type="button"
            onClick={onOpenDrawer}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        ) : null}

        {/* Brand - Only here, not duplicated in sidebar */}
        <BrandMark />

        {/* Vertical divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Breadcrumbs */}
        {role !== "teacher" ? (
          <nav className="hidden min-w-0 md:block" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              <li className="flex items-center">
                <Home className="h-3.5 w-3.5 text-gray-400" />
              </li>
              {breadcrumbs.map((crumb, idx) => (
                <li key={`${crumb.label}-${idx}`} className="flex items-center">
                  <ChevronRight className="mx-1 h-3.5 w-3.5 text-gray-300" />
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="text-sm font-medium text-gray-500 hover:text-blue-600 hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        idx === breadcrumbs.length - 1
                          ? "text-sm font-semibold text-gray-900"
                          : "text-sm font-medium text-gray-600"
                      }
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
      </div>

      {/* Right section - User menu (only here, not in sidebar) */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        {role ? (
          profilePath ? (
            <Link
              to={profilePath}
              className="hidden items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 md:flex"
            >
              <User className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-medium capitalize text-gray-700">
                {role === "super_admin" ? "Super Admin" : role}
              </span>
            </Link>
          ) : (
            <div className="hidden items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 md:flex">
              <User className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-medium capitalize text-gray-700">
                {role === "super_admin" ? "Super Admin" : role}
              </span>
            </div>
          )
        ) : null}

        {/* Logout button */}
        <button
          type="button"
          onClick={onLogout}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          aria-label="Logout"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
