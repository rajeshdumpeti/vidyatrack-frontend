import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getLoginPageCmsContent } from "@/cms";
import { LOGIN_PAGE_DEFAULTS, type LoginPageCmsContent } from "@/cms";
import { useOtpRequest } from "@/hooks/useOtpRequest";
import { useAuthStore } from "@/store/auth.store";
import type { SupportedCountryCode } from "@/types/auth.types";
import { logger } from "@/utils/logger";
import { digitsOnly } from "@/utils/phone";

import type { OtpRequestFormValues } from "../types/otpRequest.types";

const CMS_ENABLED = false;

export function useOtpRequestPage() {
  const navigate = useNavigate();
  const trace = useMemo(() => logger.traceId(), []);
  const [searchParams] = useSearchParams();
  const schoolId = useAuthStore((state) => state.schoolId);

  const schoolCodeParam =
    searchParams.get("school_code") ?? searchParams.get("school");
  const schoolCode =
    schoolCodeParam?.trim() || (schoolId ? String(schoolId) : undefined);

  const [cmsContent, setCmsContent] =
    useState<LoginPageCmsContent>(LOGIN_PAGE_DEFAULTS);
  const [countryCode, setCountryCode] = useState<SupportedCountryCode>("+91");

  useEffect(() => {
    if (!CMS_ENABLED) return;
    let isMounted = true;

    const loadCms = async () => {
      try {
        const content = await getLoginPageCmsContent({
          schoolId: schoolCode ? undefined : schoolId,
          schoolCode,
        });

        if (!isMounted) return;
        setCmsContent(content);
      } catch {
        if (!isMounted) return;
        setCmsContent(LOGIN_PAGE_DEFAULTS);
      }
    };

    void loadCms();

    return () => {
      isMounted = false;
    };
  }, [schoolId, schoolCode]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpRequestFormValues>({
    defaultValues: { phone: "" },
    mode: "onBlur",
  });

  const { requestOtp, isLoading, error } = useOtpRequest();

  const onSubmit = (values: OtpRequestFormValues) => {
    const phoneDigits = digitsOnly(values.phone);
    const phoneE164 = `${countryCode}${phoneDigits}`;

    logger.info("[auth][otp-request] submit", {
      trace,
      countryCode,
      phoneDigits,
    });

    requestOtp(phoneE164, {
      onSuccess: (result) => {
        navigate("/auth/verify", {
          state: {
            phoneDigits,
            countryCode,
            deliveryChannel: result.delivery_channel,
          },
        });
      },
      onError: (err) => {
        logger.warn("[auth][otp-request] failed", { trace, err });
      },
    });
  };

  const onNeedHelp = () =>
    logger.info("[auth][otp-request] need help clicked", { trace });

  const onTroubleLoggingIn = () =>
    logger.info("[auth][otp-request] trouble logging in clicked", { trace });

  const onTermsClick = () =>
    logger.info("[auth][otp-request] terms clicked", { trace });

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open("/legal/terms.html", "_blank", "noopener,noreferrer");
    onTermsClick?.();
  };

  return {
    cmsContent,
    countryCode,
    setCountryCode,
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isLoading,
    error,
    onSubmit,
    onNeedHelp,
    onTroubleLoggingIn,
    onTermsClick,
    handleTermsClick,
  };
}
