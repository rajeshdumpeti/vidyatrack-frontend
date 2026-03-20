import { Toast } from "@/components/feedback/Toast";

import { PrincipalOtpVerifyModal } from "./principals/components/PrincipalOtpVerifyModal";
import { PrincipalsHeader } from "./principals/components/PrincipalsHeader";
import { PrincipalsHistoryCard } from "./principals/components/PrincipalsHistoryCard";
import { PrincipalsRegistrationCard } from "./principals/components/PrincipalsRegistrationCard";
import { usePrincipalsPage } from "./principals/hooks/usePrincipalsPage";

export function PrincipalsPage() {
  const page = usePrincipalsPage();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <PrincipalsHeader />

        <PrincipalsRegistrationCard
          principal={page.principalQuery.data}
          principalLoading={page.principalQuery.isLoading}
          principalError={Boolean(page.principalQuery.error)}
          register={page.register}
          handleSubmit={page.handleSubmit}
          onSubmit={page.onSubmit}
          errors={page.errors}
          countryCode={page.countryCode}
          setCountryCode={page.setCountryCode}
          isPending={page.startMutation.isPending}
        />

        <PrincipalsHistoryCard
          history={page.deactivated}
          isLoading={page.historyQuery.isLoading}
        />
      </div>

      <PrincipalOtpVerifyModal
        open={Boolean(page.pendingSession)}
        phoneMasked={page.pendingSession?.phoneMasked ?? ""}
        expiresAt={page.pendingSession?.expiresAt ?? ""}
        otp={page.otp}
        setOtp={page.setOtp}
        onClose={page.onCloseModal}
        onVerify={page.onVerify}
        onResend={page.onResend}
        isVerifying={page.verifyMutation.isPending}
        verifyError={page.verifyMutation.error}
        isResending={page.resendMutation.isPending}
      />

      {page.toast ? (
        <Toast
          variant={page.toast.variant}
          message={page.toast.message}
          onClose={() => page.setToast(null)}
        />
      ) : null}
    </div>
  );
}
