import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiPhone, FiHelpCircle, FiArrowRight } from "react-icons/fi";
import { HiAcademicCap } from "react-icons/hi2";
import { MdWifi } from "react-icons/md";

import { digitsOnly } from "@/utils/phone";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getUserFriendlyErrorMessage } from "@/components/feedback/errorMessage";
import { useOtpRequest } from "@/hooks/useOtpRequest";
import { logger } from "@/utils/logger";
import { getLoginPageCmsContent } from "@/cms";
import {
  LOGIN_PAGE_DEFAULTS,
  type LoginPageCmsContent,
} from "@/cms";
import { useAuthStore } from "@/store/auth.store";
import type { SupportedCountryCode } from "@/types/auth.types";
import { LoadingButton } from "@/components/ui/Button";

type FormValues = {
  phone: string;
};

const CMS_ENABLED = false;

export function OtpRequestPage() {
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
  } = useForm<FormValues>({
    defaultValues: { phone: "" },
    mode: "onBlur",
  });

  const { requestOtp, isLoading, error } = useOtpRequest();

  const onSubmit = (values: FormValues) => {
    const phoneDigits = digitsOnly(values.phone);
    const phoneE164 = `${countryCode}${phoneDigits}`;

    logger.info("[auth][otp-request] submit", { trace, countryCode, phoneDigits });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
            <HiAcademicCap className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            VidyaTrack
          </span>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Need Help? 📞
        </button>
      </header>

      {/* Center card */}
      <main className="px-6">
        <div className="mx-auto mt-14 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left panel */}
            <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-10">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-white">
                  {cmsContent.brandIconUrl ? (
                    <img
                      src={cmsContent.brandIconUrl}
                      alt="Brand icon"
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <MdWifi className="h-6 w-6 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {cmsContent.heroTitle}
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600">
                  {cmsContent.heroSubtitle}
                </p>
                {cmsContent.leftPanelImageUrl ? (
                  <img
                    src={cmsContent.leftPanelImageUrl}
                    alt="Login panel"
                    className="mx-auto mt-6 max-h-40 w-auto rounded-xl"
                    loading="lazy"
                  />
                ) : null}
              </div>
            </div>

            {/* Right panel */}
            <div className="p-10">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                School Login Portal
              </h1>
              <p className="mt-3 text-sm text-gray-600">
                For Teachers, Principals & Management Staff
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 space-y-4"
              >
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Enter phone number to receive OTP on WhatsApp
                  </label>

                  {/* Phone input group (country + number) */}
                  <div
                    className={[
                      "mt-3 flex items-center rounded-full border bg-white px-4 py-3",
                      errors.phone ? "border-red-500" : "border-gray-200",
                      "focus-within:ring-2 focus-within:ring-blue-100",
                    ].join(" ")}
                  >
                    <FiPhone className="mr-3 h-4 w-4 text-gray-500" />
                    <select
                      aria-label="Country code"
                      value={countryCode}
                      onChange={(e) =>
                        setCountryCode(e.target.value as SupportedCountryCode)
                      }
                      className="bg-transparent text-sm font-medium text-gray-700 outline-none"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                    </select>
                    <span className="mx-3 h-5 w-px bg-gray-200" />
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="98765 43210"
                      className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                      {...register("phone", {
                        required: "Mobile number is required",
                        validate: (value) => {
                          const d = digitsOnly(value);
                          if (d.length < 10)
                            return "Enter a valid 10-digit mobile number";
                          if (d.length > 10)
                            return "Enter a valid 10-digit mobile number";
                          return true;
                        },
                      })}
                    />
                  </div>

                  {error ? (
                    <div className="mt-3">
                      <ErrorState
                        title="OTP not sent"
                        message={getUserFriendlyErrorMessage(error)}
                      />
                    </div>
                  ) : null}

                  {errors.phone ? (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  ) : null}
                </div>

                <LoadingButton
                  type="submit"
                  isLoading={isLoading}
                  disabled={isSubmitting}
                  loadingText="Sending OTP..."
                  leftIcon={<FiArrowRight className="h-4 w-4" />}
                  fullWidth
                  className="mt-2 rounded-full"
                >
                  Send OTP
                </LoadingButton>

                <button
                  type="button"
                  className="mx-auto flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  onClick={() =>
                    logger.info(
                      "[auth][otp-request] trouble logging in clicked",
                      { trace },
                    )
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    Not registered? Contact school administration{" "}
                    <FiHelpCircle className="h-4 w-4" />
                  </span>
                </button>

                <p className="pt-6 text-xs text-gray-500">
                  Login confirms acceptance of{" "}
                  <button
                    type="button"
                    className="underline hover:text-gray-700"
                    onClick={() =>
                      logger.info("[auth][otp-request] terms clicked", {
                        trace,
                      })
                    }
                  >
                    {cmsContent.termsText}
                  </button>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
