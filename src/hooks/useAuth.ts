import { useAuthStore } from "../store/auth.store";

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const schoolId = useAuthStore((s) => s.schoolId);

  return { accessToken, role, schoolId, isAuthed: !!accessToken };
}
