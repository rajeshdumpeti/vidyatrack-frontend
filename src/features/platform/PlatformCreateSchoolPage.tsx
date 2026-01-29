import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSchools } from "@/hooks/useSchools";
import { ArrowLeft, Loader2, School } from "lucide-react";
import { FiPhone } from "react-icons/fi";

type CreateSchoolForm = {
  name: string;
  phone: string;
};

export function PlatformCreateSchoolPage() {
  const navigate = useNavigate();
  const { create } = useSchools();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSchoolForm>({
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  const onSubmit = async (data: CreateSchoolForm) => {
    try {
      // Remove spaces and ensure we have the +91 prefix for the backend
      const digits = data.phone.replace(/\D/g, "");
      const fullPhone = `+91${digits}`;

      await create.mutateAsync({
        name: data.name.trim(),
        admin_phone: fullPhone,
      });

      // Navigate back to the list on success
      navigate("/platform/schools", {
        replace: true,
        state: { success: true },
      });
    } catch (err) {
      console.error("Failed to onboard school:", err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Schools</span>
      </button>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Register New School
          </h1>
          <p className="text-gray-500 mt-1">
            Create a school entity and its first Management Admin.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* School Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              School Name
            </label>
            <div
              className={[
                "flex items-center rounded-xl border bg-white px-4 py-3",
                errors.name ? "border-red-500" : "border-gray-200",
                "focus-within:ring-2 focus-within:ring-blue-100",
              ].join(" ")}
            >
              <School className="mr-3 h-4 w-4 text-gray-400" />
              <input
                id="name"
                type="text"
                placeholder="e.g. Saint Xavier High School"
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                {...register("name", {
                  required: "School name is required",
                  minLength: { value: 3, message: "Name is too short" },
                })}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Management Admin Phone Field (Your Requested Style) */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Management Admin Phone
            </label>
            <div
              className={[
                "flex items-center rounded-xl border bg-white px-4 py-3",
                errors.phone ? "border-red-500" : "border-gray-200",
                "focus-within:ring-2 focus-within:ring-blue-100",
              ].join(" ")}
            >
              <FiPhone className="mr-3 h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">+91</span>
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
                    // Relaxed for pilot testing to allow "B" suffix
                    if (value.length < 10) return "Number too short";
                    return true;
                  },
                })}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">
                {errors.phone.message}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              The principal will use this number to log in to the management
              dashboard.
            </p>
          </div>

          {/* Error Message if Mutation Fails */}
          {create.isError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600 font-medium">
                Failed to create school. The phone number might already be in
                use.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={create.isPending}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {create.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing Pilot Onboarding...
              </>
            ) : (
              "Confirm & Onboard School"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
