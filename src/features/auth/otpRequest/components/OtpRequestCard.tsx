import { FiArrowRight, FiPhone } from "react-icons/fi";
import { MdWifi } from "react-icons/md";
import type {
  UseFormHandleSubmit,
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";

import { ErrorState } from "@/components/feedback/ErrorState";
import { getUserFriendlyErrorMessage } from "@/components/feedback/errorMessage";
import { LoadingButton } from "@/components/ui/Button";
import type { LoginPageCmsContent } from "@/cms";

import type {
  OtpRequestCountryCode,
  OtpRequestFormValues,
} from "../types/otpRequest.types";

type OtpRequestCardProps = {
  cmsContent: LoginPageCmsContent;
  countryCode: OtpRequestCountryCode;
  setCountryCode: (value: OtpRequestCountryCode) => void;
  register: UseFormRegister<OtpRequestFormValues>;
  handleSubmit: UseFormHandleSubmit<OtpRequestFormValues>;
  onSubmit: (values: OtpRequestFormValues) => void;
  errors: FieldErrors<OtpRequestFormValues>;
  error: unknown;
  isLoading: boolean;
  isSubmitting: boolean;
  onTroubleLoggingIn: () => void;
};

export function OtpRequestCard({
  cmsContent,
  countryCode,
  setCountryCode,
  register,
  handleSubmit,
  onSubmit,
  errors,
  error,
  isLoading,
  isSubmitting,
}: OtpRequestCardProps) {
  const handleTermsClick = () => {
    window.open("/legal/terms.html", "_blank", "noopener,noreferrer");
  };

  return (
    <main className="px-6">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2">
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

          <div className="p-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              School Login Portal
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              For Teachers, Principals & Management Staff
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-900"
                >
                  Enter phone number to receive OTP on email
                </label>

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
                    onChange={(event) =>
                      setCountryCode(
                        event.target.value as OtpRequestCountryCode,
                      )
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
                        const digits = value.replace(/\D/g, "");
                        if (digits.length < 10) {
                          return "Enter a valid 10-digit mobile number";
                        }
                        if (digits.length > 10) {
                          return "Enter a valid 10-digit mobile number";
                        }
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

              {/* <button
                type="button"
                className="mx-auto flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                onClick={onTroubleLoggingIn}
              >
                <span className="inline-flex items-center gap-2">
                  Not registered? Contact school administration{" "}
                  <FiHelpCircle className="h-4 w-4" />
                </span>
              </button> */}

              <p className="pt-4 text-xs text-gray-500">
                Login confirms acceptance of{" "}
                <button
                  type="button"
                  onClick={handleTermsClick}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
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
  );
}
