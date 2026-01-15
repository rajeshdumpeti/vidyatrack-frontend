import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTeachers } from "../../../hooks/useTeachers";
import { useCreateManagementTeacher } from "../../../hooks/useCreateManagementTeacher";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { logger } from "../../../utils/logger";
import type { CreateTeacherInput, Teacher } from "../../../types/teacher.types";

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
};

export function TeachersPage() {
  const trace = useMemo(() => logger.traceId(), []);
  const { data, isLoading, error, refetch } = useTeachers();
  const createMutation = useCreateManagementTeacher();

  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(search);
    if (!q) return data;
    return data.filter((t) => matchesSearch(t, q));
  }, [data, search]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: "", phone: "", email: "" },
    mode: "onBlur",
  });

  const openAdd = () => {
    setSuccessMsg(null);
    setInlineError(null);
    reset({ name: "", phone: "", email: "" });
    setIsAdding(true);
    logger.info("[mgmt][teachers] add opened", { trace });
  };

  const closeAdd = () => {
    setInlineError(null);
    setIsAdding(false);
  };

  const onSubmit = (values: FormValues) => {
    const payload: CreateTeacherInput = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email?.trim() || undefined,
    };

    setInlineError(null);
    setSuccessMsg(null);

    createMutation.mutate(payload, {
      onSuccess: () => {
        setIsAdding(false);
        setSuccessMsg("Teacher created successfully.");
        logger.info("[mgmt][teachers] create success", {
          trace,
          phone: payload.phone,
        });
      },
      onError: (err) => {
        logger.warn("[mgmt][teachers] create failed", { trace, err });
        setInlineError("Unable to create teacher. Please try again.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <LoadingState label="Loading teachers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 space-y-3">
        <ErrorState title="Unable to load teachers" message="Please retry." />
        <button
          type="button"
          className="h-11 w-full rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900">
                Teachers
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Manage teachers (list + create). Edit/delete is disabled in
                pilot.
              </div>
            </div>

            <button
              type="button"
              className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white disabled:opacity-60"
              onClick={openAdd}
              disabled={isAdding}
            >
              Add Teacher
            </button>
          </div>

          {successMsg ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <div className="text-sm font-semibold text-green-800">
                {successMsg}
              </div>
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Search
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or email"
              type="text"
            />
          </div>

          {isAdding ? (
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="text-sm font-extrabold text-gray-900">
                New teacher
              </div>

              <form
                className="mt-3 space-y-3"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Name
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 disabled:opacity-60"
                    placeholder="Teacher name"
                    disabled={createMutation.isPending}
                    {...register("name", {
                      required: "Name is required",
                      validate: (v) =>
                        v.trim().length >= 2 || "Enter at least 2 characters",
                    })}
                  />
                  {errors.name ? (
                    <div className="mt-1 text-sm font-semibold text-red-600">
                      {errors.name.message}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Phone
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 disabled:opacity-60"
                    placeholder="10-digit mobile number"
                    disabled={createMutation.isPending}
                    {...register("phone", {
                      required: "Phone is required",
                      validate: (v) =>
                        v.trim().length >= 10 || "Enter at least 10 digits",
                    })}
                  />
                  {errors.phone ? (
                    <div className="mt-1 text-sm font-semibold text-red-600">
                      {errors.phone.message}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Email (optional)
                  </label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 disabled:opacity-60"
                    placeholder="Email"
                    disabled={createMutation.isPending}
                    {...register("email")}
                  />
                </div>

                {inlineError ? (
                  <ErrorState title="Unable to save" message={inlineError} />
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white disabled:opacity-60"
                    disabled={isSubmitting || createMutation.isPending}
                  >
                    {createMutation.isPending ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-extrabold text-gray-900 disabled:opacity-60"
                    onClick={closeAdd}
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {filtered.length === 0 ? (
            <EmptyState message="Create a teacher to get started." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs font-extrabold text-gray-600">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Mobile Number</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr
                      key={t.id}
                      className="rounded-xl border border-gray-200 bg-white"
                    >
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
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-extrabold text-gray-500"
                            disabled
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-extrabold text-gray-500"
                            disabled
                          >
                            Delete
                          </button>
                        </div>
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
