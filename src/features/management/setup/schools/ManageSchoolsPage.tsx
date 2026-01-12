import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { LoadingState } from "../../../../components/feedback/LoadingState";
import { ErrorState } from "../../../../components/feedback/ErrorState";
import { EmptyState } from "../../../../components/feedback/EmptyState";
import { useSchools } from "../../../../hooks/useSchools";
import { logger } from "../../../../utils/logger";
import type { SchoolDto } from "../../../../types/school.types";

type FormValues = {
  name: string;
};

export function ManageSchoolsPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const [toast, setToast] = useState<string | null>(null);

  const { list, create } = useSchools();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: "" },
    mode: "onBlur",
  });

  const onSubmit = (values: FormValues) => {
    setToast(null);

    create.mutate(
      { name: values.name.trim() },
      {
        onSuccess: () => {
          setToast("School created successfully.");
          reset({ name: "" });
          logger.info("[management][schools] create_success", { trace });
        },
        onError: (err) => {
          logger.error("[management][schools] create_failed", { trace, err });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="px-4 pt-6">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Schools Setup
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Management-only: create schools and view existing schools.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 space-y-5">
        {/* Success banner (ephemeral, not persisted) */}
        {toast ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            {toast}
          </div>
        ) : null}

        {/* Create form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-gray-900">
            Create School
          </div>

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
                <p className="mt-2 text-sm text-red-600">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            {create.isError ? (
              <ErrorState
                title="Create failed"
                message="Unable to create school. Please try again."
              />
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || create.isPending}
              className={[
                "h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white",
                "hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
              ].join(" ")}
            >
              {create.isPending ? "Creating..." : "Create School"}
            </button>
          </form>
        </div>

        {/* List */}
        {/* {list.isLoading ? <LoadingState title="Loading schools..." /> : null} */}

        {/* {list.error ? (
          <ErrorState
            title="Unable to load schools"
            message="Please try again."
            onRetry={() => list.refetch()}
          />
        ) : null} */}

        {/* {!list.isLoading && !list.error && (list.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No schools found"
            message="Create your first school to get started."
          />
        ) : null} */}

        {!list.isLoading && !list.error && (list.data?.length ?? 0) > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">Schools</div>
              <div className="mt-1 text-xs font-medium text-gray-500">
                Showing {list.data!.length} Schools
              </div>
            </div>

            <ul className="divide-y divide-gray-100">
              {(list.data as SchoolDto[]).map((s) => (
                <li key={s.id} className="px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {s.name}
                      </div>
                      <div className="mt-1 text-xs font-medium text-gray-500">
                        ID: <span className="text-gray-900">{s.id}</span>
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
