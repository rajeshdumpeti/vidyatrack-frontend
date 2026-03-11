import { ErrorState } from "@/components/feedback/ErrorState";
import type { FieldErrors, UseFormHandleSubmit, UseFormRegister } from "react-hook-form";

import { normalizePhoneDigits } from "../helpers/managementStudents.helpers";
import type { CreateFormValues } from "../types/managementStudents.types";

type ManagementStudentsCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: ReturnType<UseFormHandleSubmit<CreateFormValues>>;
  register: UseFormRegister<CreateFormValues>;
  errors: FieldErrors<CreateFormValues>;
  isPending: boolean;
  isError: boolean;
  selectedClassId: number | "";
  classes: Array<{ id: number; name?: string | null }>;
  availableSections: Array<{ id: number; name?: string | null; class_id: number }>;
  classLabelById: Map<number, string>;
};

export function ManagementStudentsCreateModal({
  open,
  onClose,
  onSubmit,
  register,
  errors,
  isPending,
  isError,
  selectedClassId,
  classes,
  availableSections,
  classLabelById,
}: ManagementStudentsCreateModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 shadow-lg md:inset-0 md:m-auto md:max-w-lg md:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Add New Student</h2>
          <button
            type="button"
            className="h-11 rounded-xl px-3 text-sm font-semibold text-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">1</span>
              Basic Info
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-900">First Name</label>
                <input className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none" placeholder="e.g. Rahul" {...register("first_name")} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900">Last Name</label>
                <input className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none" placeholder="e.g. Sharma" {...register("last_name")} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900">Date of Birth</label>
                <input type="date" className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none" {...register("date_of_birth")} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900">Gender</label>
                <select className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none" {...register("gender")}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-900">Full Name (fallback)</label>
                <input className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none" placeholder="Use if first/last not available" {...register("name")} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">2</span>
              Academic Info
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-900">Class</label>
                <select className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none" {...register("class_id")}>
                  <option value="">Select class</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name ?? `Class ${item.id}`} (ID: {item.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900">Section</label>
                <select className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none disabled:bg-gray-50" disabled={!selectedClassId} {...register("section_id")}>
                  <option value="">Select section</option>
                  {availableSections.map((section) => {
                    const classLabel =
                      classLabelById.get(section.class_id) ?? `Class ${section.class_id}`;
                    return (
                      <option key={section.id} value={section.id}>
                        {classLabel} - {section.name ?? `Section ${section.id}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900">Roll Number</label>
                <input className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none" placeholder="e.g. 101" {...register("roll_number")} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900">Date of Admission</label>
                <input type="date" className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none" {...register("admission_date")} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">3</span>
              Contact Info
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-900">Parent Name</label>
                <input className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none" placeholder="Full name of guardian" {...register("parent_name")} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900">Mobile Number</label>
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                  placeholder="+91 90000 00000"
                  {...register("parent_phone", {
                    required: "Parent phone is required",
                    validate: (value) => {
                      const digits = normalizePhoneDigits(value);
                      return digits.length >= 10 || "Enter a valid phone number";
                    },
                  })}
                />
                {errors.parent_phone ? (
                  <p className="mt-1 text-sm text-red-600">{errors.parent_phone.message}</p>
                ) : null}
              </div>
            </div>
          </div>

          {isError ? (
            <ErrorState
              title="Unable to create student"
              message="Please check inputs and try again."
            />
          ) : null}

          <div className="mt-2 flex gap-3">
            <button type="button" className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700" onClick={onClose} disabled={isPending}>
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {isPending ? "Saving..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
