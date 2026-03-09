import { create } from "zustand";

export type HardStopReason =
  | "offline"
  | "service_down"
  | "maintenance"
  | "subscription_expired"
  | "no_school_access"
  | "inactive_user"
  | "unknown_error";

type HardStopState = {
  reason: HardStopReason | null;
  detail?: string | null;
  setReason: (reason: HardStopReason, detail?: string | null) => void;
  clearReason: () => void;
};

export const useHardStopStore = create<HardStopState>((set) => ({
  reason: null,
  detail: null,
  setReason: (reason, detail) => set({ reason, detail: detail ?? null }),
  clearReason: () => set({ reason: null, detail: null }),
}));
