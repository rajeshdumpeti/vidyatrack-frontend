import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getHomeRouteForRole } from "@/utils/auth";
import type { NavRole } from "@/navigation/navConfig";

interface RoleGuardProps {
  allowed: NavRole;
  children: ReactNode;
}

export function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { isAuthed, role } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  // If user is in the wrong place, send them to their specific home
  if (role !== allowed) {
    const home = getHomeRouteForRole(role);
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
