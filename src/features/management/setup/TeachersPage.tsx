import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTeachers } from "@/hooks/useTeachers";
import { useSections } from "@/hooks/useSections";
import { useClasses } from "@/hooks/useClasses";
import { useCreateManagementTeacher } from "@/hooks/useCreateManagementTeacher";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { logger } from "@/utils/logger";
import { digitsOnly } from "@/utils/phone";
import type { CreateTeacherInput } from "@/types/teacher.types";
import type { SectionDto } from "@/types/section.types";
import type { ClassDto } from "@/types/class.types";

type FormValues = {
  name: string;
  phone: string;
  email?: string;
  class_id: number | "";
  section_id: number | "";
};

export function TeachersPage() {
  const trace = useMemo(() => logger.traceId(), []);

  // Queries
  const { isLoading } = useTeachers();
  const classesQuery = useClasses();
  const sectionsQuery = useSections();
  const createMutation = useCreateManagementTeacher();

  // Local UI State
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      class_id: "",
      section_id: "",
    },
    mode: "onBlur",
  });

  // Dependent Dropdown Logic
  const watchedClassId = watch("class_id");

  const availableSections = useMemo(() => {
    if (!watchedClassId || !sectionsQuery.list.data) return [];
    return sectionsQuery.list.data.filter(
      (s: SectionDto) => s.class_id === Number(watchedClassId),
    );
  }, [watchedClassId, sectionsQuery.list.data]);

  // Reset section if class changes
  useEffect(() => {
    setValue("section_id", "");
  }, [watchedClassId, setValue]);

  const clearForm = () => {
    setSuccessMsg(null);
    setInlineError(null);
    reset({ name: "", phone: "", email: "", class_id: "", section_id: "" });
  };

  const onSubmit = (values: FormValues) => {
    if (!values.section_id) {
      setInlineError("Please select a section.");
      return;
    }

    const payload: CreateTeacherInput = {
      name: values.name.trim(),
      phone: digitsOnly(values.phone),
      email: values.email?.trim() || undefined,
      section_id: Number(values.section_id),
    };

    setInlineError(null);
    setSuccessMsg(null);

    createMutation.mutate(payload, {
      onSuccess: () => {
        setSuccessMsg("Teacher created successfully.");
        clearForm();
        logger.info("[mgmt][teachers] create success", { trace });
      },
      onError: () => {
        setInlineError("Unable to create teacher. Please try again.");
      },
    });
  };

  if (isLoading) return <LoadingState label="Loading teachers..." />;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-2 space-y-4">
        {/* Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
          <div>
            <div className="text-xl font-extrabold tracking-tight text-gray-900">
              Onboard Staff
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Create teachers, assign attendance sections, and manage staff
              access.
            </div>
          </div>

          {successMsg && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
              {successMsg}
            </div>
          )}

          {/* Add Form - Always Visible */}
          <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-gray-900">
                Add New Teacher
              </div>
              <button
                type="button"
                onClick={clearForm}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear Form
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* 1. Name */}
              <div>
                <label className="text-sm font-semibold">Name</label>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Teacher name"
                  {...register("name", { required: "Name is required" })}
                />
              </div>

              {/* 2. Phone */}
              <div>
                <label className="text-sm font-semibold">Phone</label>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="10-digit mobile number"
                  {...register("phone", {
                    required: "Phone is required",
                    validate: (v) =>
                      digitsOnly(v).length === 10 || "Invalid phone",
                  })}
                />
              </div>

              {/* 3. Target Class */}
              <div>
                <label className="text-sm font-semibold">Target Class</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  {...register("class_id", { required: "Class is required" })}
                >
                  <option value="">Select Class</option>
                  {classesQuery.list.data?.map((c: ClassDto) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Target Section */}
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
                  {availableSections.map((s: SectionDto) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {watchedClassId && availableSections.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600 font-medium">
                    No sections found for this class.
                  </p>
                )}
              </div>

              {/* 5. Email */}
              <div>
                <label className="text-sm font-semibold">
                  Email (optional)
                </label>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Email"
                  {...register("email")}
                />
              </div>

              {inlineError && <ErrorState message={inlineError} />}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 font-extrabold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {createMutation.isPending ? "Creating..." : "Create Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
