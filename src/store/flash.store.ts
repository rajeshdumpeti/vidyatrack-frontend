import { create } from "zustand";

type FlashVariant = "error" | "info" | "success";

type FlashState = {
  message: string | null;
  variant: FlashVariant;
  setFlash: (message: string, variant?: FlashVariant) => void;
  clearFlash: () => void;
};

export const useFlashStore = create<FlashState>((set) => ({
  message: null,
  variant: "info",
  setFlash: (message, variant = "info") => set({ message, variant }),
  clearFlash: () => set({ message: null }),
}));
