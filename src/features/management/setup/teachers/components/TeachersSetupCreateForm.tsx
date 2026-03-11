import type { UseFormHandleSubmit, UseFormRegister } from "react-hook-form";

import { ErrorState } from "@/components/feedback/ErrorState";
import type { ClassDto } from "@/types/class.types";
import type { SectionDto } from "@/types/section.types";

import type { TeachersSetupFormValues } from "../types/teachersSetup.types";

type TeachersSetupCreateFormProps = {
  register: UseFormRegister<TeachersSetupFormValues>;
  handleSubmit: UseFormHandleSubmit<TeachersSetupFormValues>;
  onSubmit: (values: TeachersSetupFormValues) => void;
  watchedClassId: number | "";
  availableSections: SectionDto[];
  classes: ClassDto[];
  isSubmitting: boolean;
  isPending: boolean;
  inlineError: string | null;
  onClearForm: () => void;
};

export function TeachersSetupCreateForm({
  register,
  handleSubmit,
  onSubmit,
  watchedClassId,
  availableSections,
  classes,
  isSubmitting,
  isPending,
  inlineError,
  onClearForm,
}: TeachersSetupCreateFormProps) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-gray-900">Add New Teacher</div>
        <button
          type="button"
          onClick={onClearForm}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          Clear Form
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-semibold">Name</label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Teacher name"
            {...register("name", { required: "Name is required" })}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Phone</label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="10-digit mobile number"
            {...register("phone", {
              required: "Phone is required",
              validate: (value) =>
                value.replace(/\D/g, "").length === 10 || "Invalid phone",
            })}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Target Class</label>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            {...register("class_id", { required: "Class is required" })}
          >
            <option value="">Select Class</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Target Section</label>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-semibold disabled:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            disabled={!watchedClassId}
            {...register("section_id", {
              required: "Section is required",
            })}
          >
            <option value="">
              {watchedClassId ? "Select Section" : "Select Class First"}
            </option>
            {availableSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
          {watchedClassId && availableSections.length === 0 ? (
            <p className="mt-1 text-xs font-medium text-amber-600">
              No sections found for this class.
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-semibold">Email (optional)</label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Email"
            {...register("email")}
          />
        </div>

        {inlineError ? <ErrorState message={inlineError} /> : null}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 font-extrabold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isPending ? "Creating..." : "Create Teacher"}
          </button>
        </div>
      </form>
    </div>
  );
}
