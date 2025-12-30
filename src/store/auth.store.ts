import { create } from "zustand";

type UserRole = "teacher" | "principal" | "management";

type AuthState = {
  accessToken: string | null;
  role: UserRole | null;
  schoolId: string | null;

  setSession: (payload: {
    accessToken: string;
    role: UserRole;
    schoolId: string | null;
  }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  role: null,
  schoolId: null,

  setSession: ({ accessToken, role, schoolId }) =>
    set({
      accessToken,
      role,
      schoolId,
    }),

  clearSession: () =>
    set({
      accessToken: null,
      role: null,
      schoolId: null,
    }),
}));
