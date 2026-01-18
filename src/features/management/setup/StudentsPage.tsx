import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

import { useStudents, useCreateStudent } from "@/hooks//useStudents";

// Reuse existing hooks from your setup screens (do NOT create duplicates)
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections"; // if you have useSectionsByClass, use that instead

import type { StudentDto } from "@/types/student.types";
import type { StudentCreateInput } from "@/types/student.types";

type CreateFormValues = {
  name: string;
  class_id: number | ""; // UI-only
  section_id: number | "";
  parent_phone: string;
};

function normalizePhoneDigits(v: string) {
  return v.replace(/\D/g, "");
}

export function ManagementSetupStudentsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const studentsQuery = useStudents();
  const classesQuery = useClasses();
  const sectionsQuery = useSections(); // if by-class hook exists, swap accordingly
  const classesList = classesQuery.list;
  const sectionsList = sectionsQuery.list;
  const createMutation = useCreateStudent();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    defaultValues: {
      name: "",
      class_id: "",
      section_id: "",
      parent_phone: "",
    },
    mode: "onBlur",
  });

  const selectedClassId = watch("class_id");

  const availableSections = useMemo(() => {
    const all = sectionsList.data ?? [];
    if (!selectedClassId) return [];
    const classIdNum = Number(selectedClassId);
    // If your sections DTO includes class_id (typical), filter here.
    return all.filter((s: any) => s.class_id === classIdNum);
  }, [sectionsList.data, selectedClassId]);

  const filteredStudents = useMemo(() => {
    const list = studentsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((s: StudentDto) => {
      const name = (s.name ?? "").toLowerCase();
      const phone = (s.parent_phone ?? "").toLowerCase();
      const roll = String((s as any).roll_no ?? "").toLowerCase();
      return name.includes(q) || phone.includes(q) || roll.includes(q);
    });
  }, [studentsQuery.data, search]);

  const onClose = () => {
    setIsOpen(false);
    createMutation.reset();
    reset();
  };

  const onSubmit = async (values: CreateFormValues) => {
    // Validation should already catch empty; this is just fail-safe.
    if (!values.section_id) return;

    const payload: StudentCreateInput = {
      name: values.name.trim(),
      section_id: Number(values.section_id),
      parent_phone: normalizePhoneDigits(values.parent_phone),
    };

    await createMutation.mutateAsync(payload);
    onClose();
  };

  const isBootLoading =
    studentsQuery.isLoading || classesList.isLoading || sectionsList.isLoading;

  const hasBootError =
    !!studentsQuery.error || !!classesList.error || !!sectionsList.error;

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900">Students</h1>

        <button
          type="button"
          className="h-11 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
          onClick={() => setIsOpen(true)}
        >
          + Add Student
        </button>
      </div>

      {/* Search */}
      <div className="mt-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, roll no, or parent phone"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-300"
        />
      </div>

      {/* States */}
      <div className="mt-4">
        {isBootLoading ? <LoadingState /> : null}

        {!isBootLoading && hasBootError ? (
          <div className="space-y-3">
            <ErrorState
              title="Unable to load students setup"
              message="Please retry."
            />
            <button
              type="button"
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900"
              onClick={() => {
                studentsQuery.refetch();
                classesList.refetch();
                sectionsList.refetch();
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isBootLoading && !hasBootError && filteredStudents.length === 0 ? (
          <EmptyState message="Add a student to get started." />
        ) : null}

        {!isBootLoading && !hasBootError && filteredStudents.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Class / Section</th>
                    <th className="px-4 py-3">Parent Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((s: any) => (
                    <tr key={s.id} className="text-gray-900">
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3">
                        {/* Keep contract-safe: show section_id if no label exists */}
                        {s.section_label ?? `Section ${s.section_id ?? "-"}`}
                      </td>
                      <td className="px-4 py-3">{s.parent_phone ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {/* Create modal / inline form */}
      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 shadow-lg md:inset-0 md:m-auto md:max-w-lg md:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Add Student
              </h2>
              <button
                type="button"
                className="h-11 rounded-xl px-3 text-sm font-semibold text-gray-700"
                onClick={onClose}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-900">
                  Student Name
                </label>
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                  {...register("name", {
                    required: "Student name is required",
                    validate: (v) =>
                      v.trim().length >= 2 || "Enter at least 2 characters",
                  })}
                />
                {errors.name ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900">
                  Class
                </label>
                <select
                  className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
                  {...register("class_id", { required: "Class is required" })}
                >
                  <option value="">Select class</option>
                  {(classesList.data ?? []).map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name ?? `Class ${c.id}`}
                    </option>
                  ))}
                </select>
                {errors.class_id ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.class_id.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900">
                  Section
                </label>
                <select
                  className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none disabled:bg-gray-50"
                  disabled={!selectedClassId}
                  {...register("section_id", {
                    required: "Section is required",
                  })}
                >
                  <option value="">Select section</option>
                  {availableSections.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name ?? `Section ${s.id}`}
                    </option>
                  ))}
                </select>
                {errors.section_id ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.section_id.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900">
                  Parent Phone
                </label>
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                  inputMode="numeric"
                  {...register("parent_phone", {
                    required: "Parent phone is required",
                    validate: (v) => {
                      const d = normalizePhoneDigits(v);
                      return d.length >= 10 || "Enter a valid phone number";
                    },
                  })}
                />
                {errors.parent_phone ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.parent_phone.message}
                  </p>
                ) : null}
              </div>

              {createMutation.isError ? (
                <ErrorState
                  title="Unable to create student"
                  message="Please check inputs and try again."
                />
              ) : null}

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="h-11 w-full rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {createMutation.isPending ? "Saving..." : "Save Student"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
