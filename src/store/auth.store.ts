import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { decodeJwtPayload, coerceRole } from "@/utils/auth";

interface AuthState {
  accessToken: string | null;
  role: "management" | "principal" | "teacher" | null;
  schoolId: number | null;
  setToken: (token: string) => void;
  setAuthMeta: (meta: {
    role?: string | null;
    schoolId?: number | string | null;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      schoolId: null,

      setToken: (token) => {
        const payload = decodeJwtPayload<{ role?: string; school_id?: any }>(
          token,
        );
        set({
          accessToken: token,
          role: coerceRole(payload?.role),
          schoolId: payload?.school_id ? Number(payload.school_id) : null,
        });
      },

      setAuthMeta: (meta) =>
        set((state) => ({
          role: coerceRole(meta.role) ?? state.role,
          schoolId: meta.schoolId ? Number(meta.schoolId) : state.schoolId,
        })),

      clearAuth: () => set({ accessToken: null, role: null, schoolId: null }),
    }),
    {
      name: "vidyatrack-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
