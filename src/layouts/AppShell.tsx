import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  CreditCard,
  LogOut,
  Menu,
  ServerCrash,
  ShieldAlert,
  UserX,
  WifiOff,
  Wrench,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { NavRole } from "@/navigation/navConfig";
import { NAV_ITEMS } from "@/navigation/navConfig";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/utils/logger";
import { HardStop } from "@/components/feedback/HardStop";
import { BrandMark } from "@/components/brand/BrandMark";
import { useHardStopStore } from "@/store/hardStop.store";
// Test mode: show modal immediately, auto-logout in 2 minutes.
const IDLE_WARNING_MS = 14 * 60 * 1000;
const IDLE_LOGOUT_MS = 15 * 60 * 1000;
const IDLE_WARNING_COOLDOWN_MS = 2 * 60 * 1000;
const IDLE_HARD_STOP_TEST = false;

export function AppShell() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("vt_sidebar_collapsed") === "1";
  });
  const [idleWarningOpen, setIdleWarningOpen] = useState(false);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState<number>(120);
  const idleLogoutAtRef = useRef<number | null>(null);
  const warnTimeoutRef = useRef<number | null>(null);
  const logoutTimeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const resetIdleRef = useRef<() => void>(() => undefined);
  const warningDisabledUntilRef = useRef<number>(0);
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const schools = useAuthStore((s) => s.schools);
  const schoolsLoaded = useAuthStore((s) => s.schoolsLoaded);
  const hardStopReason = useHardStopStore((s) => s.reason);
  const hardStopDetail = useHardStopStore((s) => s.detail);
  const clearHardStop = useHardStopStore((s) => s.clearReason);
  const setHardStop = useHardStopStore((s) => s.setReason);
  const shouldShowIdleModal =
    // eslint-disable-next-line react-hooks/purity
    idleWarningOpen && Date.now() >= warningDisabledUntilRef.current;

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
    const locationState = location.state as {
      breadcrumbLabel?: string;
    } | null;
    const activeItem = navItems.items.find((item) => item.to === pathname);
    const roleLabel =
      role === "management"
        ? "Management"
        : role === "principal"
          ? "Principal"
          : role === "super_admin"
            ? "Platform"
            : "Teacher";

    const rolePath =
      role === "management"
        ? "/management"
        : role === "principal"
          ? "/principal"
          : role === "super_admin"
            ? "/platform"
            : "/teacher";

    if (activeItem) {
      return [
        { label: roleLabel, to: rolePath },
        { label: activeItem.label, to: undefined },
      ];
    }

    const segments = pathname.split("/").filter(Boolean);
    if (!segments.length) return [{ label: roleLabel, to: undefined }];
    const rawTail = segments[segments.length - 1];
    const parentSegment = segments[segments.length - 2] ?? "";
    if (parentSegment === "students" || parentSegment === "teachers") {
      const parentLabel =
        parentSegment === "students" ? "Students" : "Teachers";
      return [
        { label: roleLabel, to: rolePath },
        { label: parentLabel, to: `${rolePath}/${parentSegment}` },
        {
          label:
            locationState?.breadcrumbLabel?.trim() ||
            (parentSegment === "students" ? "Student" : "Teacher"),
          to: pathname,
        },
      ];
    }
    const tail = /^\d+$/.test(rawTail)
      ? locationState?.breadcrumbLabel?.trim() || "Details"
      : rawTail.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return [
      { label: roleLabel, to: rolePath },
      { label: tail, to: undefined },
    ];
  }, [location.pathname, location.state, navItems.items, role]);
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

  useEffect(() => {
    if (!accessToken) return;
    if (!schoolsLoaded) return;
    if (role === "super_admin") return;
    if (schools.length === 0) {
      setHardStop("no_school_access");
    }
  }, [accessToken, schoolsLoaded, schools.length, role, setHardStop]);

  useEffect(() => {
    const onOffline = () => setHardStop("offline");
    const onOnline = () => {
      if (hardStopReason === "offline") {
        clearHardStop();
      }
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [hardStopReason, setHardStop, clearHardStop]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const reason = localStorage.getItem("vt_hardstop_reason");
    if (reason) {
      setHardStop(reason as any);
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "vt_hardstop_reason") return;
      if (!e.newValue) {
        clearHardStop();
        return;
      }
      setHardStop(e.newValue as any);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setHardStop, clearHardStop]);

  useEffect(() => {
    if (!accessToken) return;

    const clearTimers = () => {
      if (warnTimeoutRef.current) window.clearTimeout(warnTimeoutRef.current);
      if (logoutTimeoutRef.current)
        window.clearTimeout(logoutTimeoutRef.current);
      if (countdownRef.current) window.clearInterval(countdownRef.current);
      warnTimeoutRef.current = null;
      logoutTimeoutRef.current = null;
      countdownRef.current = null;
    };

    const startCountdown = () => {
      if (!idleLogoutAtRef.current) return;
      if (countdownRef.current) window.clearInterval(countdownRef.current);
      countdownRef.current = window.setInterval(() => {
        if (!idleLogoutAtRef.current) return;
        const remaining = Math.max(
          0,
          Math.ceil((idleLogoutAtRef.current - Date.now()) / 1000),
        );
        setIdleSecondsLeft(remaining);
        if (remaining <= 0) {
          window.clearInterval(countdownRef.current ?? undefined);
          countdownRef.current = null;
        }
      }, 1000);
    };

    const resetTimers = () => {
      clearTimers();
      setIdleWarningOpen(false);
      idleLogoutAtRef.current = Date.now() + IDLE_LOGOUT_MS;
      setIdleSecondsLeft(Math.ceil(IDLE_LOGOUT_MS / 1000));
      const now = Date.now();
      const blockedUntil = warningDisabledUntilRef.current;
      if (blockedUntil > now) {
        warnTimeoutRef.current = null;
      } else {
        const warnDelay = IDLE_WARNING_MS;
        warnTimeoutRef.current = window.setTimeout(() => {
          if (Date.now() < warningDisabledUntilRef.current) return;
          setIdleWarningOpen(true);
          startCountdown();
        }, warnDelay);
      }
      logoutTimeoutRef.current = window.setTimeout(() => {
        onLogout();
      }, IDLE_LOGOUT_MS);
    };
    resetIdleRef.current = resetTimers;

    const handleActivity = () => {
      if (idleWarningOpen) return;
      resetTimers();
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((evt) => window.addEventListener(evt, handleActivity));

    resetTimers();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearTimers();
    };
  }, [accessToken]);

  useEffect(() => {
    if (!IDLE_HARD_STOP_TEST) return;
    setIdleWarningOpen(true);
    idleLogoutAtRef.current = Date.now() + IDLE_LOGOUT_MS;
    setIdleSecondsLeft(Math.ceil(IDLE_LOGOUT_MS / 1000));
  }, []);

  return (
    <div className="h-screen overflow-hidden">
      {hardStopReason ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          {hardStopReason === "offline" ? (
            <HardStop
              tone="warning"
              icon={<WifiOff className="h-5 w-5" />}
              title="You’re offline"
              description="No internet connection detected. Check your network and try again."
              primaryAction={{
                label: "Retry",
                onClick: () => {
                  if (navigator.onLine) clearHardStop();
                },
              }}
              secondaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "service_down" ? (
            <HardStop
              tone="warning"
              icon={<ServerCrash className="h-5 w-5" />}
              title="Service temporarily unavailable"
              description="We’re having trouble reaching VidyaTrack services. Please try again in a few minutes."
              primaryAction={{
                label: "Retry",
                onClick: () => window.location.reload(),
              }}
              secondaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "maintenance" ? (
            <HardStop
              tone="info"
              icon={<Wrench className="h-5 w-5" />}
              title="Maintenance in progress"
              description="VidyaTrack is updating right now. Please check back shortly."
              primaryAction={{
                label: "Refresh",
                onClick: () => window.location.reload(),
              }}
              secondaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "subscription_expired" ? (
            <HardStop
              tone="danger"
              icon={<CreditCard className="h-5 w-5" />}
              title="Subscription expired"
              description="Your school’s subscription is inactive. Please contact the administrator to renew access."
              primaryAction={{
                label: "Contact Support",
                onClick: () => {
                  window.location.href = "mailto:support@vidyatrack.com";
                },
              }}
              secondaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "inactive_user" ? (
            <HardStop
              tone="danger"
              icon={<UserX className="h-5 w-5" />}
              title="Account inactive"
              description="Your account has been disabled. Please contact your administrator."
              primaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "no_school_access" ? (
            <HardStop
              tone="warning"
              icon={<ShieldAlert className="h-5 w-5" />}
              title="No school access"
              description="Your account isn’t linked to a school yet. Ask your admin to add you."
              primaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "unknown_error" ? (
            <HardStop
              tone="warning"
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Something went wrong"
              description={hardStopDetail ?? "Please try again."}
              primaryAction={{
                label: "Refresh",
                onClick: () => window.location.reload(),
              }}
              secondaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
        </div>
      ) : null}
      {!hardStopReason && shouldShowIdleModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <HardStop
            tone="warning"
            icon={<Clock className="h-5 w-5" />}
            title="You’re about to be signed out"
            description={`For your security, we sign out after inactivity. You will be logged out in ${Math.floor(
              idleSecondsLeft / 60,
            )
              .toString()
              .padStart(2, "0")}:${(idleSecondsLeft % 60)
              .toString()
              .padStart(2, "0")}.`}
            primaryAction={{
              label: "Stay Signed In",
              onClick: () => {
                warningDisabledUntilRef.current =
                  Date.now() + IDLE_WARNING_COOLDOWN_MS;
                setIdleWarningOpen(false);
                resetIdleRef.current();
              },
            }}
            secondaryAction={{
              label: "Logout Now",
              onClick: onLogout,
            }}
          />
        </div>
      ) : null}
      <div className="mx-auto h-full overflow-hidden rounded-[1.75rem] bg-[#f6f8f7] shadow-[0_24px_50px_rgba(15,23,42,0.08)] md:rounded-[2rem]">
        <div className="mx-auto flex h-full w-full flex-col">
          <header className="flex h-14 items-center justify-between border-b border-gray-200/80 bg-white/85 px-3 md:h-16 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              {role !== "teacher" ? (
                <button
                  type="button"
                  onClick={openDrawer}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              ) : null}
              <BrandMark
                suffix={
                  <span className="hidden md:inline">Smart School Suite</span>
                }
              />
              <div className="hidden min-w-0 md:block">
                <div className="truncate text-sm font-semibold text-gray-500">
                  {crumbs.map((crumb, idx) => (
                    <span key={`${crumb.label}-${idx}`}>
                      {crumb.to ? (
                        <Link
                          to={crumb.to}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span
                          className={
                            idx === crumbs.length - 1
                              ? "text-gray-900"
                              : "text-blue-600"
                          }
                        >
                          {crumb.label}
                        </span>
                      )}
                      {idx < crumbs.length - 1 ? (
                        <span className="px-2 text-gray-300">›</span>
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                aria-label="Logout"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1">
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
            <main className="flex-1 overflow-y-auto px-0">
              <Outlet />
            </main>
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
