import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { NAV_ITEMS, type NavRole } from "@/navigation/navConfig";
import { useAuthStore } from "@/store/auth.store";
import { useHardStopStore } from "@/store/hardStop.store";
import { logger } from "@/utils/logger";

import { buildAppShellBreadcrumbs } from "../helpers/appShell.helpers";

const IDLE_WARNING_MS = 14 * 60 * 1000;
const IDLE_LOGOUT_MS = 15 * 60 * 1000;
const IDLE_WARNING_COOLDOWN_MS = 2 * 60 * 1000;
const IDLE_HARD_STOP_TEST = false;

export function useAppShell() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem("vt_sidebar_collapsed") === "1",
  );
  const [idleWarningOpen, setIdleWarningOpen] = useState(IDLE_HARD_STOP_TEST);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState<number>(() =>
    Math.ceil(IDLE_LOGOUT_MS / 1000),
  );
  const idleLogoutAtRef = useRef<number | null>(null);
  const warnTimeoutRef = useRef<number | null>(null);
  const logoutTimeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const resetIdleRef = useRef<() => void>(() => undefined);
  const warningDisabledUntilRef = useRef<number>(0);
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const accessToken = useAuthStore((state) => state.accessToken);
  const schools = useAuthStore((state) => state.schools);
  const schoolsLoaded = useAuthStore((state) => state.schoolsLoaded);
  const hardStopReason = useHardStopStore((state) => state.reason);
  const hardStopDetail = useHardStopStore((state) => state.detail);
  const clearHardStop = useHardStopStore((state) => state.clearReason);
  const setHardStop = useHardStopStore((state) => state.setReason);
  const shouldShowIdleModal = idleWarningOpen;
  const trace = useMemo(() => logger.traceId(), []);
  const role = useAuthStore((state) => state.role) as NavRole | null;

  const onLogout = useCallback(() => {
    clearAuth();
    navigate("/", { replace: true });
  }, [clearAuth, navigate]);

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

  const breadcrumbs = useMemo(
    () =>
      buildAppShellBreadcrumbs({
        pathname: location.pathname,
        locationState: location.state as { breadcrumbLabel?: string } | null,
        navItems: navItems.items,
        role,
      }),
    [location.pathname, location.state, navItems.items, role],
  );

  useEffect(() => {
    if (!isDrawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen]);

  useEffect(() => {
    localStorage.setItem("vt_sidebar_collapsed", isSidebarCollapsed ? "1" : "0");
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
      setHardStop(reason as never);
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "vt_hardstop_reason") return;
      if (!event.newValue) {
        clearHardStop();
        return;
      }
      setHardStop(event.newValue as never);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setHardStop, clearHardStop]);

  useEffect(() => {
    if (!accessToken) return;

    const clearTimers = () => {
      if (warnTimeoutRef.current) window.clearTimeout(warnTimeoutRef.current);
      if (logoutTimeoutRef.current) window.clearTimeout(logoutTimeoutRef.current);
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
      if (blockedUntil <= now) {
        warnTimeoutRef.current = window.setTimeout(() => {
          if (Date.now() < warningDisabledUntilRef.current) return;
          setIdleWarningOpen(true);
          startCountdown();
        }, IDLE_WARNING_MS);
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
    events.forEach((event) => window.addEventListener(event, handleActivity));

    resetTimers();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimers();
    };
  }, [accessToken, idleWarningOpen, onLogout]);

  const onStaySignedIn = () => {
    warningDisabledUntilRef.current = Date.now() + IDLE_WARNING_COOLDOWN_MS;
    setIdleWarningOpen(false);
    resetIdleRef.current();
  };

  const onRetryOffline = () => {
    if (navigator.onLine) clearHardStop();
  };

  return {
    isDrawerOpen,
    isSidebarCollapsed,
    idleSecondsLeft,
    hardStopReason,
    hardStopDetail,
    shouldShowIdleModal,
    role,
    navItems,
    breadcrumbs,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    toggleSidebarCollapse: () => setIsSidebarCollapsed((prev) => !prev),
    onLogout,
    onRetryOffline,
    onRefresh: () => window.location.reload(),
    onContactSupport: () => {
      window.location.href = "mailto:support@vidyatrack.com";
    },
    onStaySignedIn,
  };
}
