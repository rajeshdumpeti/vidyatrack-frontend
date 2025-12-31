import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { digitsOnly } from "../../utils/phone";
import { FiPhone, FiHelpCircle, FiArrowRight } from "react-icons/fi";
import { HiAcademicCap } from "react-icons/hi2";
import { MdWifi } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { requestOtp } from "../../api/auth.api";
import { ErrorState } from "../../components/feedback/ErrorState";
import { getUserFriendlyErrorMessage } from "../../components/feedback/errorMessage";

type FormValues = {
  phone: string;
};

export function OtpRequestPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { phone: "" },
    mode: "onBlur",
  });

  const otpRequestMutation = useMutation({
    mutationFn: async (phone: string) => {
      await requestOtp(`+91${phone}`);
    },
  });

  const onSubmit = (values: FormValues) => {
    const phoneDigits = digitsOnly(values.phone);

    otpRequestMutation.mutate(phoneDigits, {
      onSuccess: () => {
        // Do not lose phone value on navigation
        navigate("/auth/verify", { state: { phoneDigits } });
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
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <MdWifi className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  One Platform, Complete School
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600">
                  Attendance • Grades • Parent Communication • Reports
                </p>
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
                    Your Mobile Number
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
                    <span className="text-sm font-medium text-gray-700">
                      +91
                    </span>
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
                            return "Enter a valid 10-digit Indian mobile number";
                          if (d.length > 10)
                            return "Enter a valid 10-digit Indian mobile number";
                          return true;
                        },
                      })}
                    />
                  </div>
                  {otpRequestMutation.isError ? (
                    <div className="mt-3">
                      <ErrorState
                        title="OTP not sent"
                        message={getUserFriendlyErrorMessage(
                          otpRequestMutation.error
                        )}
                      />
                    </div>
                  ) : null}

                  {errors.phone ? (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otpRequestMutation.isPending}
                  className={[
                    "mt-2 w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white",
                    "hover:bg-blue-700",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2">
                    {otpRequestMutation.isPending
                      ? "Sending OTP..."
                      : "Send OTP"}
                    <FiArrowRight className="h-4 w-4" />
                  </span>
                </button>

                <button
                  type="button"
                  className="mx-auto flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  onClick={() =>
                    console.log(
                      "[auth][otp-request] trouble logging in clicked"
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
                      console.log("[auth][otp-request] terms clicked")
                    }
                  >
                    Terms & Privacy Policy
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
