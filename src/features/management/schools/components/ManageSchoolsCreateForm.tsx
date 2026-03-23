import type { UseFormHandleSubmit, UseFormRegister, FieldErrors } from "react-hook-form";
import { blockNonPhoneKeys } from "@/helpers/phone";

import { ErrorState } from "@/components/feedback/ErrorState";

import type { ManageSchoolsFormValues } from "../types/manageSchools.types";

type ManageSchoolsCreateFormProps = {
  register: UseFormRegister<ManageSchoolsFormValues>;
  handleSubmit: UseFormHandleSubmit<ManageSchoolsFormValues>;
  errors: FieldErrors<ManageSchoolsFormValues>;
  isSubmitting: boolean;
  isPending: boolean;
  isError: boolean;
  onSubmit: (values: ManageSchoolsFormValues) => void;
};

export function ManageSchoolsCreateForm({
  register,
  handleSubmit,
  errors,
  isSubmitting,
  isPending,
  isError,
  onSubmit,
}: ManageSchoolsCreateFormProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-gray-900">Create School</div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900">
            School Name
          </label>
          <input
            className={[
              "mt-2 h-12 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-gray-900 outline-none",
              "placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
              errors.name ? "border-red-500" : "border-gray-200",
            ].join(" ")}
            placeholder="Enter school name"
            {...register("name", {
              required: "School name is required",
              validate: (v) =>
                v.trim().length > 1 ? true : "Enter a valid school name",
            })}
          />
          {errors.name ? (
            <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Admin Phone
          </label>
          <input
            type="tel"
            inputMode="numeric"
            className={[
              "mt-2 h-12 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-gray-900 outline-none",
              "placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
              errors.admin_phone ? "border-red-500" : "border-gray-200",
            ].join(" ")}
            placeholder="+91XXXXXXXXXX or +1XXXXXXXXXX"
            onKeyDown={blockNonPhoneKeys}
            {...register("admin_phone", {
              required: "Admin phone is required",
              validate: (v) =>
                v.trim().length >= 10
                  ? true
                  : "Enter a valid admin phone number",
            })}
          />
          {errors.admin_phone ? (
            <p className="mt-2 text-sm text-red-600">
              {errors.admin_phone.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Admin Email
          </label>
          <input
            className={[
              "mt-2 h-12 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-gray-900 outline-none",
              "placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
              errors.admin_email ? "border-red-500" : "border-gray-200",
            ].join(" ")}
            placeholder="admin@school.edu"
            {...register("admin_email", {
              required: "Admin email is required",
              validate: (v) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
                  ? true
                  : "Enter a valid admin email",
            })}
          />
          {errors.admin_email ? (
            <p className="mt-2 text-sm text-red-600">
              {errors.admin_email.message}
            </p>
          ) : null}
        </div>

        {isError ? (
          <ErrorState
            title="Create failed"
            message="Unable to create school. Please try again."
          />
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className={[
            "h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white",
            "hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          {isPending ? "Creating..." : "Create School"}
        </button>
      </form>
    </div>
  );
}
