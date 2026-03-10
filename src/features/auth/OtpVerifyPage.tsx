import { AuthTopBar } from "./components/AuthTopBar";
import { OtpVerifyCard } from "./otpVerify/components/OtpVerifyCard";
import { useOtpVerifyPage } from "./otpVerify/hooks/useOtpVerifyPage";

export function OtpVerifyPage() {
  const page = useOtpVerifyPage();

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthTopBar />
      <OtpVerifyCard
        register={page.register}
        handleSubmit={page.handleSubmit}
        onSubmit={page.onSubmit}
        setInputRef={page.setInputRef}
        onDigitChange={page.handleDigitChange}
        onKeyDown={page.handleKeyDown}
        isVerifying={page.isVerifying}
        isSubmitting={page.isSubmitting}
        hasPhone={page.hasPhone}
        verifyError={page.verifyError}
        resendError={page.resendError}
        isResending={page.isResending}
        onResend={page.onResend}
        deliveryChannel={page.deliveryChannel}
        maskedPhone={page.maskedPhone}
        onNeedHelp={page.onNeedHelp}
      />
    </div>
  );
}
