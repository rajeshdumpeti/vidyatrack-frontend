import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  School,
  Plus,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { useSchools } from "@/hooks/useSchools";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";

type FormValues = { name: string };

export function ManageSchoolsPage() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { schools, isLoading, isError, createSchool, isCreating } =
    useSchools();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "" },
  });

  const onSubmit = (values: FormValues) => {
    setSuccessMsg(null);
    createSchool(
      { name: values.name.trim() },
      {
        onSuccess: () => {
          setSuccessMsg("School added to the platform.");
          reset();
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Schools Setup</h1>
        <p className="text-sm text-gray-500">
          Configure and manage educational institutions in the system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <section className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Plus className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-gray-900">Add New School</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  School Name
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  placeholder="e.g. St. Xavier's High"
                  className={`mt-1 h-12 w-full rounded-xl border px-4 text-sm font-medium transition-all outline-none
                    ${errors.name ? "border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {successMsg && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs font-bold text-green-700">
                  <CheckCircle2 className="h-4 w-4" /> {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 h-12 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create School"
                )}
              </button>
            </form>
          </section>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            /* Updated to match your ErrorState props */
            <ErrorState
              title="Unable to load schools"
              message="There was a connection error. Please refresh the page."
            />
          ) : schools.length === 0 ? (
            /* Updated to match your EmptyState props */
            <EmptyState message="No schools registered yet. Start by creating one on the left." />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <h3 className="text-sm font-bold text-gray-900">
                  Registered Institutions ({schools.length})
                </h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {schools.map((school) => (
                  <li
                    key={school.id}
                    className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <School className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {school.name}
                        </p>
                        <p className="text-[11px] font-medium text-gray-400">
                          ID: VT-{school.id.toString().padStart(4, "0")}
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all">
                      Details <ChevronRight className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
