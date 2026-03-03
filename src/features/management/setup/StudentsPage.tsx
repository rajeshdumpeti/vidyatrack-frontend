/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

import {
  useStudents,
  useCreateStudent,
  usePreviewStudentsImport,
  useCommitStudentsImport,
} from "@/hooks//useStudents";

// Reuse existing hooks from your setup screens (do NOT create duplicates)
import { useClasses } from "@/hooks/useClasses";
import { useSections } from "@/hooks/useSections"; // if you have useSectionsByClass, use that instead

import type { StudentDto } from "@/types/student.types";
import type { StudentCreateInput } from "@/types/student.types";
import type {
  StudentImportCommitResponse,
  StudentImportPreviewResponse,
} from "@/types/student.types";
import { LoadingButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { Toast } from "@/components/feedback/Toast";

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
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sectionId, setSectionId] = useState<string>("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<StudentImportPreviewResponse | null>(null);
  const [commitResult, setCommitResult] = useState<StudentImportCommitResponse | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  const studentsQuery = useStudents();
  const classesQuery = useClasses();
  const sectionsQuery = useSections(); // if by-class hook exists, swap accordingly
  const classesList = classesQuery.list;
  const sectionsList = sectionsQuery.list;
  const createMutation = useCreateStudent();
  const previewImportMutation = usePreviewStudentsImport();
  const commitImportMutation = useCommitStudentsImport();

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
  const studentsPagination = usePagination(filteredBySection, {
    initialPageSize: 20,
    resetDeps: [search, sectionId],
  });

  const selectedAcademicContext = useMemo(() => {
    if (!sectionIdNumber) {
      return {
        className: "All Classes",
        sectionName: "All Sections",
      };
    }

    const section = (sectionsList.data ?? []).find((s: any) => s.id === sectionIdNumber);
    const className = section?.class_id
      ? classLabelById.get(section.class_id) ?? `Class ${section.class_id}`
      : "Unknown Class";
    const sectionName = section?.name ?? `Section ${sectionIdNumber}`;

    return { className, sectionName };
  }, [sectionIdNumber, sectionsList.data, classLabelById]);

  const previewAcademicGroups = useMemo(() => {
    if (!previewData) return [];
    const grouped = new Map<string, number>();
    previewData.rows.forEach((row) => {
      const className = row.class_name?.trim() || "Unknown Class";
      const sectionName = row.section_name?.trim() || "Unknown Section";
      const key = `${className} / ${sectionName}`;
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [previewData]);

  const onClose = () => {
    setIsOpen(false);
    createMutation.reset();
    reset();
  };

  const onOpenImport = () => {
    setIsImportOpen(true);
    setImportFile(null);
    setPreviewData(null);
    setCommitResult(null);
    previewImportMutation.reset();
    commitImportMutation.reset();
  };

  const onCloseImport = () => {
    setIsImportOpen(false);
    setImportFile(null);
    setPreviewData(null);
    setCommitResult(null);
    previewImportMutation.reset();
    commitImportMutation.reset();
  };

  const downloadTemplate = () => {
    const csv = [
      "first_name,last_name,name,parent_phone,parent_name,class_name,section_name,roll_number,date_of_birth,gender,admission_date",
      "Rahul,Sharma,,9876511111,Suresh Sharma,Grade 6th,A,101,2012-04-10,male,2024-06-10",
      "Ananya,Verma,,9876522222,Priya Verma,Grade 6th,A,102,2012-08-21,female,2024-06-10",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vidyatrack_students_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreviewImport = async () => {
    if (previewImportMutation.isPending || commitImportMutation.isPending) return;
    if (!importFile) return;
    const data = await previewImportMutation.mutateAsync(importFile);
    setPreviewData(data);
    setCommitResult(null);
  };

  const handleCommitImport = async () => {
    if (commitImportMutation.isPending || previewImportMutation.isPending) return;
    if (!previewData?.import_token) return;
    const res = await commitImportMutation.mutateAsync({
      import_token: previewData.import_token,
      mode: "skip_duplicates",
    });
    setCommitResult(res);
    setToast(
      `Student import completed: ${res.created_rows} created, ${res.duplicate_rows} duplicates, ${res.failed_rows} failed.`,
    );
    onCloseImport();
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onOpenImport}
          >
            Import Students
          </button>
          <button
            type="button"
            className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => setIsOpen(true)}
          >
            + Add Student
          </button>
        </div>
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
              Section
            </label>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-gray-300 disabled:opacity-60"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              disabled={sectionsList.isLoading}
            >
              <option value="">All Sections</option>
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
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Guardian</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentsPagination.pagedItems.map((s: StudentDto) => {
                    const classLabel =
                      s.class_name ??
                      ((sectionsList.data ?? []).find((section: any) => section.id === s.section_id)
                        ?.class_name ?? "—");
                    const onlySectionLabel =
                      s.section_name ??
                      ((sectionsList.data ?? []).find((section: any) => section.id === s.section_id)
                        ?.name ?? `Section ${s.section_id ?? "—"}`);
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
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/management/students/${s.id}`, {
                                state: { breadcrumbLabel: s.name ?? "Student" },
                              })
                            }
                            className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                          >
                            {s.name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                          {studentCode}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {classLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                            {onlySectionLabel}
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
                            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                            onClick={() =>
                              navigate(`/management/students/${s.id}`, {
                                state: { breadcrumbLabel: s.name ?? "Student" },
                              })
                            }
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
            <Pagination
              page={studentsPagination.page}
              pageSize={studentsPagination.pageSize}
              totalItems={studentsPagination.totalItems}
              totalPages={studentsPagination.totalPages}
              from={studentsPagination.from}
              to={studentsPagination.to}
              onPageChange={studentsPagination.setPage}
              onPageSizeChange={studentsPagination.setPageSize}
            />
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
                  className="h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {createMutation.isPending ? "Saving..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isImportOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseImport} />
          <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-lg md:inset-10 md:mx-auto md:max-w-5xl md:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Import Students (Bulk)
              </h2>
              <button
                type="button"
                className="h-10 rounded-xl px-3 text-sm font-semibold text-gray-700"
                onClick={onCloseImport}
              >
                Close
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Academic Context
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border border-blue-200 bg-white px-3 py-1 font-semibold text-blue-900">
                  Class: {selectedAcademicContext.className}
                </span>
                <span className="rounded-full border border-blue-200 bg-white px-3 py-1 font-semibold text-blue-900">
                  Section: {selectedAcademicContext.sectionName}
                </span>
              </div>
              <p className="mt-2 text-xs text-blue-700">
                CSV rows should include `class_name` and `section_name` to map students correctly.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={downloadTemplate}
                className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800"
              >
                Download CSV Template
              </button>
              <input
                type="file"
                accept=".csv"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                disabled={previewImportMutation.isPending || commitImportMutation.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImportFile(file);
                  setPreviewData(null);
                  setCommitResult(null);
                }}
              />
              <LoadingButton
                type="button"
                onClick={handlePreviewImport}
                disabled={!importFile || commitImportMutation.isPending}
                isLoading={previewImportMutation.isPending}
                loadingText="Validating..."
                fullWidth
                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                Preview Import
              </LoadingButton>
            </div>

            {previewImportMutation.isError ? (
              <div className="mt-4">
                <ErrorState
                  title="Unable to preview import"
                  message="Please check CSV format and class/section names."
                />
              </div>
            ) : null}

            {previewData ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="text-xs text-gray-500">Total Rows</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {previewData.total_rows}
                    </div>
                  </div>
                  <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                    <div className="text-xs text-green-700">Valid</div>
                    <div className="text-lg font-semibold text-green-800">
                      {previewData.valid_rows}
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <div className="text-xs text-amber-700">Duplicates</div>
                    <div className="text-lg font-semibold text-amber-800">
                      {previewData.duplicate_rows}
                    </div>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                    <div className="text-xs text-red-700">Invalid</div>
                    <div className="text-lg font-semibold text-red-800">
                      {previewData.invalid_rows}
                    </div>
                  </div>
                </div>

                {previewAcademicGroups.length > 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Academic Distribution (Preview)
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {previewAcademicGroups.map((group) => (
                        <span
                          key={group.label}
                          className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                        >
                          {group.label}: {group.count}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[960px] text-left text-sm">
                      <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-3 py-2">Row</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Student</th>
                          <th className="px-3 py-2">Class</th>
                          <th className="px-3 py-2">Section</th>
                          <th className="px-3 py-2">Phone</th>
                          <th className="px-3 py-2">Errors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewData.rows.map((row) => (
                          <tr key={row.row_number}>
                            <td className="px-3 py-2">{row.row_number}</td>
                            <td className="px-3 py-2">
                              <span
                                className={[
                                  "rounded-full px-2 py-1 text-xs font-semibold",
                                  row.status === "valid"
                                    ? "bg-green-50 text-green-700"
                                    : row.status === "duplicate"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-red-50 text-red-700",
                                ].join(" ")}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">{row.student_name || "—"}</td>
                            <td className="px-3 py-2">{row.class_name || "—"}</td>
                            <td className="px-3 py-2">{row.section_name || "—"}</td>
                            <td className="px-3 py-2">{row.parent_phone || "—"}</td>
                            <td className="px-3 py-2 text-xs text-red-700">
                              {row.errors.join(", ") || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onCloseImport}
                    className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="button"
                    disabled={
                      !previewData.import_token ||
                      previewData.valid_rows === 0 ||
                      previewImportMutation.isPending
                    }
                    onClick={handleCommitImport}
                    isLoading={commitImportMutation.isPending}
                    loadingText="Importing..."
                    className="h-11 rounded-xl bg-blue-600 px-5 text-sm hover:bg-blue-700"
                  >
                    Confirm Import
                  </LoadingButton>
                </div>
              </div>
            ) : null}

            {commitResult ? (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm font-semibold text-gray-900">
                  Import Completed
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="text-sm text-gray-700">
                    Total: <strong>{commitResult.total_rows}</strong>
                  </div>
                  <div className="text-sm text-green-700">
                    Created: <strong>{commitResult.created_rows}</strong>
                  </div>
                  <div className="text-sm text-amber-700">
                    Duplicates: <strong>{commitResult.duplicate_rows}</strong>
                  </div>
                  <div className="text-sm text-red-700">
                    Failed: <strong>{commitResult.failed_rows}</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {commitImportMutation.isPending ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35">
          <div className="rounded-2xl border border-blue-100 bg-white px-8 py-6 text-center shadow-xl">
            <div className="text-base font-bold text-gray-900">
              Importing students...
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Please wait while we process the file.
            </div>
          </div>
        </div>
      ) : null}
      {toast ? (
        <Toast
          variant="success"
          message={toast}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
