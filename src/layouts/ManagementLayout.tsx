import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { AppShell } from "./AppShell";

export function ManagementLayout() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const role = useAuthStore((s) => s.role);

  // If they are management but haven't picked a school yet, send them to select
  if (role === "management" && !schoolId) {
    return <Navigate to="/auth/select-school" replace />;
  }

  return <AppShell />;
}
