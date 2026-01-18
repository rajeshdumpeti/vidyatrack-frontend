import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections";
import { logger } from "@/utils/logger";
import type { ClassDto } from "@/types/class.types";
import type { SectionDto } from "@/types/section.types";

type FormValues = {
  class_id: string; // keep as string for <select>
  name: string;
};

export function ManageSectionsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [toast, setToast] = useState<string | null>(null);

  const classes = useClasses();
  const sections = useSections();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { class_id: "", name: "" },
    mode: "onBlur",
  });

  const onSubmit = (values: FormValues) => {
    setToast(null);

    const classIdNum = Number(values.class_id);
    if (!Number.isFinite(classIdNum) || classIdNum <= 0) return;

    sections.create.mutate(
      { class_id: classIdNum, name: values.name.trim() },
      {
        onSuccess: () => {
          setToast("Section created successfully.");
          reset({ class_id: values.class_id, name: "" });
          logger.info("[management][sections] create_success", {
            trace,
            class_id: classIdNum,
          });
        },
        onError: (err) => {
          logger.error("[management][sections] create_failed", { trace, err });
        },
      }
    );
  };

  const isLoading = classes.list.isLoading || sections.list.isLoading;
  const hasError = Boolean(classes.list.error || sections.list.error);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="px-4 pt-6">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Sections Setup
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Management-only: create sections and view existing sections.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 space-y-5">
        {toast ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            {toast}
          </div>
        ) : null}

        {/* Create form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-gray-900">
            Create Section
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Class
              </label>

              {classes.list.isLoading ? (
                <div className="mt-2">
                  <LoadingState label="Loading classes..." />
                </div>
              ) : classes.list.error ? (
                <div className="mt-2">
                  <ErrorState
                    title="Unable to load classes"
                    message="Please try again."
                  />
                </div>
              ) : (
                <select
                  className={[
                    "mt-2 h-12 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-gray-900 outline-none",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                    errors.class_id ? "border-red-500" : "border-gray-200",
                  ].join(" ")}
                  {...register("class_id", {
                    required: "Class is required",
                    validate: (v) =>
                      Number(v) > 0 ? true : "Select a valid class",
                  })}
                >
                  <option value="">Select a class</option>
                  {(classes.list.data as ClassDto[] | undefined)?.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}

              {errors.class_id ? (
                <p className="mt-2 text-sm text-red-600">
                  {errors.class_id.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Section Name
              </label>
              <input
                className={[
                  "mt-2 h-12 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-gray-900 outline-none",
                  "placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                  errors.name ? "border-red-500" : "border-gray-200",
                ].join(" ")}
                placeholder="Enter section name (e.g., A)"
                {...register("name", {
                  required: "Section name is required",
                  validate: (v) =>
                    v.trim().length >= 1 ? true : "Enter a valid section name",
                })}
              />
              {errors.name ? (
                <p className="mt-2 text-sm text-red-600">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            {sections.create.isError ? (
              <ErrorState
                title="Create failed"
                message="Unable to create section. Please try again."
              />
            ) : null}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                sections.create.isPending ||
                classes.list.isLoading
              }
              className={[
                "h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white",
                "hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
              ].join(" ")}
            >
              {sections.create.isPending ? "Creating..." : "Create Section"}
            </button>
          </form>
        </div>

        {/* List */}
        {isLoading ? <LoadingState label="Loading sections..." /> : null}

        {hasError ? (
          <ErrorState
            title="Unable to load sections"
            message="Please try again."
          />
        ) : null}

        {!isLoading && !hasError && (sections.list.data?.length ?? 0) === 0 ? (
          <EmptyState message="Create your first section to get started." />
        ) : null}

        {!isLoading && !hasError && (sections.list.data?.length ?? 0) > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">
                Sections
              </div>
              <div className="mt-1 text-xs font-medium text-gray-500">
                Showing {sections.list.data!.length} Sections
              </div>
            </div>

            <ul className="divide-y divide-gray-100">
              {(sections.list.data as SectionDto[]).map((s) => (
                <li key={s.id} className="px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {s.name}
                      </div>
                      <div className="mt-1 text-xs font-medium text-gray-500">
                        Class:{" "}
                        <span className="text-gray-900">
                          {s.class_name ? s.class_name : `#${s.class_id}`}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex h-9 items-center rounded-full bg-gray-900 px-4 text-sm font-semibold text-white">
                      View
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </main>
    </div>
  );
}
