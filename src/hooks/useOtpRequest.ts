import { useMutation } from "@tanstack/react-query";
import { requestOtp } from "../api/auth.api";

export function useOtpRequest() {
  const mutation = useMutation({
    mutationFn: async (phoneE164: string) => {
      await requestOtp(phoneE164);
    },
  });

  return {
    requestOtp: mutation.mutate,
    requestOtpAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
