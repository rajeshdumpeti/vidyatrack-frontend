import { useEffect } from "react";
import { Toast } from "./Toast";
import { useFlashStore } from "@/store/flash.store";

export function FlashToast() {
  const { message, variant, clearFlash } = useFlashStore();

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(clearFlash, 5000);
    return () => clearTimeout(t);
  }, [message, clearFlash]);

  if (!message) return null;
  return <Toast message={message} variant={variant} onClose={clearFlash} />;
}
