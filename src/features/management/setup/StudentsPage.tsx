/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

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
  first_name: string;
  last_name: string;
  name: string;
  class_id: number | ""; // UI-only
  section_id: number | "";
  parent_phone: string;
  parent_name: string;
  date_of_birth: string;
  gender: string;
  roll_number: string;
  admission_date: string;
};

function normalizePhoneDigits(v: string) {
  return v.replace(/\D/g, "");
}

export function ManagementSetupStudentsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sectionId, setSectionId] = useState<string>("");
  const navigate = useNavigate();

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
      first_name: "",
      last_name: "",
      name: "",
      class_id: "",
      section_id: "",
      parent_phone: "",
      parent_name: "",
      date_of_birth: "",
      gender: "",
      roll_number: "",
      admission_date: "",
    },
    mode: "onBlur",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedClassId = watch("class_id");

  const classLabelById = useMemo(() => {
    const map = new Map<number, string>();
    (classesList.data ?? []).forEach((c: any) => {
      map.set(c.id, c.name ?? `Class ${c.id}`);
    });
    return map;
  }, [classesList.data]);

  const availableSections = useMemo(() => {
    const all = sectionsList.data ?? [];
    if (!selectedClassId) return [];
    const classIdNum = Number(selectedClassId);
    // If your sections DTO includes class_id (typical), filter here.
    return all.filter((s: any) => s.class_id === classIdNum);
  }, [sectionsList.data, selectedClassId]);

  const sectionLabelById = useMemo(() => {
    const map = new Map<number, string>();
    (sectionsList.data ?? []).forEach((s: any) => {
      const classLabel = classLabelById.get(s.class_id) ?? `Class ${s.class_id}`;
      map.set(s.id, `${classLabel} - ${s.name ?? `Section ${s.id}`}`);
    });
    return map;
  }, [sectionsList.data, classLabelById]);

  const filteredStudents = useMemo(() => {
    const list = studentsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((s: StudentDto) => {
      const name = (s.name ?? "").toLowerCase();
      const code = String(s.student_code ?? "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [studentsQuery.data, search]);

  const sectionIdNumber = sectionId ? Number(sectionId) : null;
  const filteredBySection = useMemo(() => {
    if (!sectionIdNumber) return filteredStudents;
    return filteredStudents.filter((s) => s.section_id === sectionIdNumber);
  }, [filteredStudents, sectionIdNumber]);

  const onClose = () => {
    setIsOpen(false);
    createMutation.reset();
    reset();
  };

  const onSubmit = async (values: CreateFormValues) => {
    if (!values.parent_phone.trim()) return;
    if (
      !values.name.trim() &&
      !values.first_name.trim() &&
      !values.last_name.trim()
    )
      return;

    const first = values.first_name.trim();
    const last = values.last_name.trim();
    const fallbackName = values.name.trim();

    const payload: StudentCreateInput = {
      parent_phone: normalizePhoneDigits(values.parent_phone),
      section_id: values.section_id ? Number(values.section_id) : undefined,
      parent_name: values.parent_name.trim() || undefined,
      date_of_birth: values.date_of_birth || undefined,
      gender: values.gender || undefined,
      roll_number: values.roll_number.trim() || undefined,
      admission_date: values.admission_date || undefined,
    };

    if (first || last) {
      payload.first_name = first || undefined;
      payload.last_name = last || undefined;
    } else if (fallbackName) {
      payload.name = fallbackName;
    }

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
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Students</h1>
          <div className="text-sm text-gray-600">
            Enroll students into sections after classes and sections are ready.
          </div>
        </div>

        <button
          type="button"
          className="h-11 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
          onClick={() => setIsOpen(true)}
        >
          + Add Student
        </button>
      </div>

      {/* Search + Filter */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600">
              Search
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or admission number..."
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-300"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600">
              All Classes
            </label>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-gray-300 disabled:opacity-60"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              disabled={sectionsList.isLoading}
            >
              <option value="">All Classes</option>
              {(sectionsList.data ?? []).map((s: any) => {
                const label =
                  sectionLabelById.get(s.id) ?? `Section ${s.id}`;
                return (
                  <option key={s.id} value={s.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
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

        {!isBootLoading && !hasBootError && filteredBySection.length === 0 ? (
          <EmptyState message="Add a student to get started." />
        ) : null}

        {!isBootLoading && !hasBootError && filteredBySection.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">
                Showing {filteredBySection.length} Students
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Avatar</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Guardian</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBySection.map((s: StudentDto) => {
                    const sectionLabel =
                      s.section_name && s.class_name
                        ? `${s.class_name} - ${s.section_name}`
                        : sectionLabelById.get(s.section_id) ??
                          `Section ${s.section_id}`;
                    const initials = (s.name ?? "?")
                      .trim()
                      .slice(0, 2)
                      .toUpperCase();
                    const contact = s.parent_phone ?? "—";
                    const studentCode = s.student_code ?? "—";
                    const guardianName = s.parent_name ?? "—";
                    const status = (s.status ?? "inactive").toLowerCase();
                    const statusLabel =
                      status === "active" ? "Active" : "Inactive";
                    const statusClasses =
                      status === "active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200";

                    return (
                      <tr key={s.id} className="align-middle">
                        <td className="px-4 py-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                            {initials}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {s.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                          {studentCode}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {sectionLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {guardianName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {contact}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
                            onClick={() => navigate(`/management/students/${s.id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
                Add New Student
              </h2>
              <button
                type="button"
                className="h-11 rounded-xl px-3 text-sm font-semibold text-gray-700"
                onClick={onClose}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                    1
                  </span>
                  Basic Info
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      First Name
                    </label>
                    <input
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                      placeholder="e.g. Rahul"
                      {...register("first_name")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Last Name
                    </label>
                    <input
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                      placeholder="e.g. Sharma"
                      {...register("last_name")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                      {...register("date_of_birth")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Gender
                    </label>
                    <select
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
                      {...register("gender")}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-900">
                      Full Name (fallback)
                    </label>
                    <input
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                      placeholder="Use if first/last not available"
                      {...register("name")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                    2
                  </span>
                  Academic Info
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Class
                    </label>
                    <select
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
                      {...register("class_id")}
                    >
                      <option value="">Select class</option>
                      {(classesList.data ?? []).map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name ?? `Class ${c.id}`} (ID: {c.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Section
                    </label>
                    <select
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none disabled:bg-gray-50"
                      disabled={!selectedClassId}
                      {...register("section_id")}
                    >
                      <option value="">Select section</option>
                      {availableSections.map((s: any) => {
                        const classLabel =
                          classLabelById.get(s.class_id) ??
                          `Class ${s.class_id}`;
                        return (
                          <option key={s.id} value={s.id}>
                            {classLabel} - {s.name ?? `Section ${s.id}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Roll Number
                    </label>
                    <input
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                      placeholder="e.g. 101"
                      {...register("roll_number")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Date of Admission
                    </label>
                    <input
                      type="date"
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                      {...register("admission_date")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                    3
                  </span>
                  Contact Info
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Parent Name
                    </label>
                    <input
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                      placeholder="Full name of guardian"
                      {...register("parent_name")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-900">
                      Mobile Number
                    </label>
                    <input
                      className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                      placeholder="+91 90000 00000"
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
                </div>
              </div>

              {createMutation.isError ? (
                <ErrorState
                  title="Unable to create student"
                  message="Please check inputs and try again."
                />
              ) : null}

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700"
                  onClick={onClose}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="h-11 w-full rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {createMutation.isPending ? "Saving..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
