import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTeachers } from "@/hooks/useTeachers";
import { useSections } from "@/hooks/useSections";
import { useClasses } from "@/hooks/useClasses"; // Ensure this hook exists
import { useCreateManagementTeacher } from "@/hooks/useCreateManagementTeacher";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { logger } from "@/utils/logger";
import { digitsOnly } from "@/utils/phone";
import type { CreateTeacherInput, Teacher } from "@/types/teacher.types";
import type { SectionDto } from "@/types/section.types";
import type { ClassDto } from "@/types/class.types";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function matchesSearch(t: Teacher, q: string) {
  const hay = [t.name ?? "", t.phone ?? "", t.email ?? ""]
    .map(normalize)
    .join(" ");
  return hay.includes(q);
}

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
  const { data, isLoading, error, refetch } = useTeachers();
  const classesQuery = useClasses();
  const sectionsQuery = useSections();
  const createMutation = useCreateManagementTeacher();

  // Local UI State
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
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

  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;
    return data.filter((t) => matchesSearch(t, q));
  }, [data, search]);

  const openAdd = () => {
    setSuccessMsg(null);
    setInlineError(null);
    reset({ name: "", phone: "", email: "", class_id: "", section_id: "" });
    setIsAdding(true);
  };

  const closeAdd = () => {
    setInlineError(null);
    setIsAdding(false);
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
        setIsAdding(false);
        setSuccessMsg("Teacher created successfully.");
        logger.info("[mgmt][teachers] create success", { trace });
      },
      onError: (err) => {
        setInlineError("Unable to create teacher. Please try again.");
      },
    });
  };

  if (isLoading) return <LoadingState label="Loading teachers..." />;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-4">
        {/* Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900">
                Teachers
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Onboard teachers and set their attendance section.
              </div>
            </div>
            <button
              className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white"
              onClick={openAdd}
              disabled={isAdding}
            >
              Add Teacher
            </button>
          </div>

          {successMsg && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
              {successMsg}
            </div>
          )}

          {/* Search Box */}
          <input
            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-semibold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email"
          />

          {/* Add Form */}
          {isAdding && (
            <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
              <div className="text-sm font-extrabold text-gray-900">
                New teacher
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* 1. Name */}
                <div>
                  <label className="text-sm font-semibold">Name</label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm"
                    placeholder="Teacher name"
                    {...register("name", { required: "Name is required" })}
                  />
                </div>

                {/* 2. Phone */}
                <div>
                  <label className="text-sm font-semibold">Phone</label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm"
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
                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-semibold"
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
                  <label className="text-sm font-semibold">
                    Target Section
                  </label>
                  <select
                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm font-semibold disabled:bg-gray-50"
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
                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm"
                    placeholder="Email"
                    {...register("email")}
                  />
                </div>

                {inlineError && <ErrorState message={inlineError} />}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-blue-600 font-extrabold text-white"
                    disabled={isSubmitting}
                  >
                    {createMutation.isPending ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="h-11 w-full rounded-xl border border-gray-200 font-extrabold"
                    onClick={closeAdd}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Teacher List Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {filtered.length === 0 ? (
            <EmptyState message="No teachers found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs font-extrabold text-gray-600 uppercase">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Mobile Number</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="bg-white">
                      <td className="px-3 py-3 text-sm font-extrabold text-gray-900">
                        {t.name}
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-gray-900">
                        {t.phone ?? "-"}
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-gray-900">
                        {t.email ?? "-"}
                      </td>
                      <td className="px-3 py-3">
                        <button disabled className="text-gray-400 font-bold">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
