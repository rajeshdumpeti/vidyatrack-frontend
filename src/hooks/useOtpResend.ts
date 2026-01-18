import { useMutation } from "@tanstack/react-query";
import { requestOtp } from "@/api/auth.api";

export function useOtpResend() {
  const mutation = useMutation({
    mutationFn: async (phoneE164: string) => {
      await requestOtp(phoneE164);
    },
  });

  return {
    resendOtp: mutation.mutate,
    resendOtpAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
