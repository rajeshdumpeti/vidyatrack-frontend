import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

type AllowedRole = "teacher" | "principal" | "management";

function homeForRole(role: AllowedRole) {
  if (role === "teacher") return "/teacher";
  if (role === "principal") return "/principal";
  return "/management";
}

export function RoleGuard({
  allowed,
  children,
}: {
  allowed: AllowedRole;
  children: ReactNode;
}) {
  const { isAuthed, role } = useAuth();
  const location = useLocation();

  // No token => force login
  if (!isAuthed) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  // Token exists but role missing/invalid => safest behavior is login
  if (!role) {
    return <Navigate to="/auth/login" replace />;
  }

  // Wrong role => redirect to correct home
  if (role !== allowed) {
    return <Navigate to={homeForRole(role)} replace />;
  }

  // OK
  return <>{children}</>;
}
