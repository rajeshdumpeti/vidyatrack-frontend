import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { FiHelpCircle } from "react-icons/fi";
import { HiAcademicCap, HiLockClosed } from "react-icons/hi2";

import type { AuthLocationState, OtpCodeDigits } from "./auth.types";
import {
  buildOtpCode,
  digitsFromInput,
  isOtpComplete,
  maskPhoneDigits,
} from "./otp.utils";

type FormValues = {
  d1: string;
  d2: string;
  d3: string;
  d4: string;
};

function toDigits(values: FormValues): OtpCodeDigits {
  return [values.d1, values.d2, values.d3, values.d4];
}

export function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as AuthLocationState;

  const maskedPhone = useMemo(
    () => maskPhoneDigits(state.phoneDigits),
    [state.phoneDigits]
  );

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { d1: "", d2: "", d3: "", d4: "" },
  });

  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const focusIndex = (i: number) => inputs.current[i]?.focus();

  const setDigit = (key: keyof FormValues, value: string) => {
    setValue(key, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  };

  const handleDigitChange =
    (index: 0 | 1 | 2 | 3, key: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Paste support: if user pastes 2–4 digits into any input, fill forward.
      const pasted = digitsFromInput(raw, 4);
      if (pasted.length > 1) {
        const keys: (keyof FormValues)[] = ["d1", "d2", "d3", "d4"];
        keys.forEach((k, i) => setDigit(k, pasted[i] ?? ""));
        focusIndex(Math.min(pasted.length - 1, 3));
        return;
      }

      const single = digitsFromInput(raw, 1)[0] ?? "";
      setDigit(key, single);
      if (single && index < 3) focusIndex(index + 1);
    };

  const handleKeyDown =
    (index: 0 | 1 | 2 | 3, key: keyof FormValues) =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        const cur = getValues()[key];
        if (!cur && index > 0) focusIndex(index - 1);
      }
      if (e.key === "Escape") {
        navigate("/auth/login", { replace: true });
      }
    };

  const onSubmit = (values: FormValues) => {
    const digits = toDigits(values);
    const code = buildOtpCode(digits);

    // UI-only verification (Tech Lead requirement)
    console.log("[auth][otp-verify] submit", {
      code,
      isComplete: isOtpComplete(digits),
      phoneDigits: state.phoneDigits,
    });

    // No API integration in this sprint step.
  };

  const onResend = () =>
    console.log("[auth][otp-verify] resend", {
      phoneDigits: state.phoneDigits,
    });
  const onNeedHelp = () => console.log("[auth][otp-verify] need help clicked");

  return (
    <div className="min-h-screen bg-gray-50">
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
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-lg">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <HiLockClosed className="h-7 w-7 text-blue-600" />
            </div>
          </div>

          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Verify Account
          </h1>

          <p className="mt-3 text-center text-sm text-gray-600">
            We sent a 4-digit code to
          </p>
          <p className="mt-1 text-center text-sm font-semibold text-gray-900">
            {maskedPhone}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
            <div className="flex justify-center gap-4">
              {(["d1", "d2", "d3", "d4"] as const).map((key, idx) => {
                const { ref, ...rest } = register(key);
                return (
                  <input
                    key={key}
                    ref={(el) => {
                      ref(el); // register's ref
                      inputs.current[idx] = el; // your custom ref
                    }}
                    inputMode="numeric"
                    maxLength={4}
                    className="h-14 w-14 rounded-xl border border-gray-200 text-center text-xl font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    {...rest}
                    onChange={handleDigitChange(idx as 0 | 1 | 2 | 3, key)}
                    onKeyDown={handleKeyDown(idx as 0 | 1 | 2 | 3, key)}
                  />
                );
              })}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Verify
            </button>

            <div className="mt-6 text-center text-sm text-gray-600">
              Didn’t receive the code?{" "}
              <button
                type="button"
                className="font-semibold text-blue-600 hover:text-blue-700"
                onClick={onResend}
              >
                Resend
              </button>
            </div>
          </form>

          <button
            type="button"
            className="mx-auto mt-10 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            onClick={onNeedHelp}
          >
            <FiHelpCircle className="h-4 w-4" />
            Need help?
          </button>
        </div>
      </main>
    </div>
  );
}
