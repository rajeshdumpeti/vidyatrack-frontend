import { useMutation } from "@tanstack/react-query";
import { verifyOtp } from "../api/auth.api";

export function useOtpVerify() {
  const mutation = useMutation({
    mutationFn: async (payload: { phoneE164: string; otp: string }) => {
      return verifyOtp(payload.phoneE164, payload.otp);
    },
  });

  return {
    verifyOtp: mutation.mutate,
    verifyOtpAsync: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
