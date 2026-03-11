import { AlertTriangle, Phone, ShieldCheck, UserRound } from "lucide-react";
import type { FieldErrors, UseFormHandleSubmit, UseFormRegister } from "react-hook-form";

import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import type { ManagementPrincipalResult } from "@/types/managementPrincipal.types";

import type {
  PrincipalCountryCode,
  PrincipalFormValues,
} from "../types/principals.types";

type PrincipalsRegistrationCardProps = {
  principal: ManagementPrincipalResult | undefined;
  principalLoading: boolean;
  principalError: boolean;
  register: UseFormRegister<PrincipalFormValues>;
  handleSubmit: UseFormHandleSubmit<PrincipalFormValues>;
  onSubmit: (values: PrincipalFormValues) => Promise<void>;
  errors: FieldErrors<PrincipalFormValues>;
  countryCode: PrincipalCountryCode;
  setCountryCode: (value: PrincipalCountryCode) => void;
  isPending: boolean;
};

export function PrincipalsRegistrationCard({
  principal,
  principalLoading,
  principalError,
  register,
  handleSubmit,
  onSubmit,
  errors,
  countryCode,
  setCountryCode,
  isPending,
}: PrincipalsRegistrationCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" />
          <div>
            <p className="text-sm font-bold text-amber-800">Important Note</p>
            <p className="mt-1 text-sm font-medium text-amber-700">
              New principal assignment happens only after OTP verification. The
              existing principal is deactivated after successful verification.
            </p>
          </div>
        </div>
      </div>

      {principalLoading ? (
        <div className="mt-4">
          <LoadingState label="Loading current principal..." />
        </div>
      ) : principal ? (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Current Principal
          </p>
          <p className="mt-1 text-base font-bold text-blue-900">{principal.name}</p>
          <p className="mt-0.5 text-sm font-medium text-blue-700">
            {principal.phone}
            {principal.email ? ` • ${principal.email}` : ""}
          </p>
        </div>
      ) : null}

      {!principal && !principalLoading && !principalError ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">
            No principal assigned yet
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Proceed to register your first principal.
          </p>
        </div>
      ) : null}

      {principalError && !principal ? (
        <div className="mt-4">
          <ErrorState
            title="Unable to load principal"
            message="Please refresh and try again."
          />
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-900">Full Name *</label>
          <div className="relative mt-2">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. Dr. Anita Sharma"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {errors.name ? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-900">
            Mobile Number (for OTP Login) *
          </label>
          <div className="mt-2 flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <Phone className="mr-2 h-4 w-4 text-slate-400" />
            <select
              aria-label="Country code"
              value={countryCode}
              onChange={(event) =>
                setCountryCode(event.target.value as PrincipalCountryCode)
              }
              className="cursor-pointer bg-transparent text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
            </select>
            <span className="mx-3 h-5 w-px bg-slate-200" />
            <input
              {...register("phone", {
                required: "Phone is required",
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
              inputMode="numeric"
              type="tel"
              placeholder="98765 00000"
              className="h-full w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            OTP will be sent to this principal number.
          </p>
          {errors.phone ? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-900">
            Email Address (Optional)
          </label>
          <input
            {...register("email")}
            placeholder="principal@school-domain.com"
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center gap-1 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" />
            {isPending ? "Sending OTP..." : "Register & Verify"}
          </button>
        </div>
      </form>
    </section>
  );
}
