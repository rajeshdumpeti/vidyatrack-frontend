import { OtpRequestCard } from "./otpRequest/components/OtpRequestCard";
import { useOtpRequestPage } from "./otpRequest/hooks/useOtpRequestPage";

export function OtpRequestPage() {
  const page = useOtpRequestPage();

  return (
    <OtpRequestCard
      cmsContent={page.cmsContent}
      countryCode={page.countryCode}
      setCountryCode={page.setCountryCode}
      register={page.register}
      handleSubmit={page.handleSubmit}
      onSubmit={page.onSubmit}
      errors={page.errors}
      error={page.error}
      isLoading={page.isLoading}
      isSubmitting={page.isSubmitting}
      onTroubleLoggingIn={page.onTroubleLoggingIn}
    />
  );
}
