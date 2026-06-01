import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Download, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

import { getClasses } from "@/api/classes.api";
import { getManagementStudentsExportUrl, getManagementStudentsSummary } from "@/api/managementPortfolio.api";
import { getSections } from "@/api/sections.api";
import { createStudent, getStudents } from "@/api/students.api";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Toast } from "@/components/feedback/Toast";
import { useAuthStore } from "@/store/auth.store";

function phoneToE164(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("91") ? `+${digits}` : `+91${digits}`;
}

export function ManagementEnrollmentPage() {
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    class_id: "",
    section_id: "",
    parent_name: "",
    parent_phone: "",
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  });

  const summaryQuery = useQuery({
    queryKey: ["management-enrollment-summary", schoolId],
    queryFn: () => getManagementStudentsSummary(schoolId!),
    enabled: Boolean(schoolId),
  });
  const studentsQuery = useQuery({
    queryKey: ["management-enrollment-students", schoolId],
    queryFn: () => getStudents(schoolId!, { page: 1, limit: 12 }),
    enabled: Boolean(schoolId),
  });
  const classesQuery = useQuery({
    queryKey: ["management-enrollment-classes", schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: Boolean(schoolId),
  });
  const sectionsQuery = useQuery({
    queryKey: ["management-enrollment-sections", schoolId],
    queryFn: () => getSections(schoolId!),
    enabled: Boolean(schoolId),
  });

  const availableSections = useMemo(
    () => (sectionsQuery.data ?? []).filter((section) => String(section.class_id) === form.class_id),
    [sectionsQuery.data, form.class_id],
  );

  const draftMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) return null;
      return createStudent(
        {
          name: form.name,
          section_id: Number(form.section_id),
          academic_year: form.academic_year,
          parent_name: form.parent_name,
          parent_phone: phoneToE164(form.parent_phone),
          status: "DRAFT",
        },
        schoolId,
      );
    },
    onSuccess: () => {
      setToast("Draft enrollment created");
      setForm((prev) => ({
        ...prev,
        name: "",
        parent_name: "",
        parent_phone: "",
        class_id: "",
        section_id: "",
      }));
      void queryClient.invalidateQueries({ queryKey: ["management-enrollment-students", schoolId] });
      void queryClient.invalidateQueries({ queryKey: ["management-enrollment-summary", schoolId] });
    },
  });

  const students = studentsQuery.data?.data ?? [];
  const drafts = students.filter((student) => (student.status ?? "").toLowerCase() === "draft");

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Enrollment</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Admissions and class distribution</h1>
            <p className="mt-2 text-sm text-slate-600">
              Create draft enrollments fast, then complete the full admission profile before activation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/management/enrollment/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
            >
              <PlusCircle className="h-4 w-4" />
              Full admission wizard
            </Link>
            {schoolId ? (
              <button
                type="button"
                onClick={() => window.open(getManagementStudentsExportUrl(schoolId), "_blank", "noopener,noreferrer")}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {summaryQuery.isLoading || studentsQuery.isLoading || classesQuery.isLoading || sectionsQuery.isLoading ? (
        <LoadingState label="Loading enrollment data..." />
      ) : null}
      {summaryQuery.isError || studentsQuery.isError || classesQuery.isError || sectionsQuery.isError ? (
        <ErrorState title="Unable to load enrollment view" message="Please retry." />
      ) : null}

      {summaryQuery.data ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total Students</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{summaryQuery.data.total_students}</div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Year Growth</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {summaryQuery.data.new_admissions_this_month} new this month
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Coverage</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {summaryQuery.data.classes_covered} classes • {summaryQuery.data.sections_covered} sections
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Draft Enrollments</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{drafts.length}</div>
          </article>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Quick admission entry</h2>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{form.academic_year}</div>
          </div>
          <div className="mt-5 grid gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Student full name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
                placeholder="Aarav Sharma"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Grade / Class</label>
                <select
                  value={form.class_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, class_id: e.target.value, section_id: "" }))}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
                >
                  <option value="">Select class</option>
                  {(classesQuery.data ?? []).map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Section</label>
                <select
                  value={form.section_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, section_id: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
                >
                  <option value="">Select section</option>
                  {availableSections.map((section) => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Parent / Guardian name</label>
              <input
                value={form.parent_name}
                onChange={(e) => setForm((prev) => ({ ...prev, parent_name: e.target.value }))}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
                placeholder="Primary guardian"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Contact number</label>
              <input
                value={form.parent_phone}
                onChange={(e) => setForm((prev) => ({ ...prev, parent_phone: e.target.value }))}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
                placeholder="+91 98765 43210"
              />
            </div>
            <button
              type="button"
              disabled={draftMutation.isPending || !form.name || !form.section_id || !form.parent_name || !form.parent_phone}
              onClick={() => draftMutation.mutate()}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {draftMutation.isPending ? "Creating..." : "Create Draft Enrollment"}
            </button>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Recent enrollments</h2>
            <Link to="/management/students" className="text-sm font-bold text-indigo-600">Open full registry</Link>
          </div>
          <div className="mt-5 space-y-3">
            {students.map((student) => (
              <div key={student.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-900">{student.name}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {student.class_name ?? "—"} • {student.section_name ?? "—"} • {student.parent_phone}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      (student.status ?? "").toLowerCase() === "draft"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {(student.status ?? "active").toUpperCase()}
                    </span>
                    <Link
                      to={`/management/enrollment/${student.public_id ?? student.id}/complete`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600"
                    >
                      Complete
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {!students.length ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                No enrollments yet.
              </div>
            ) : null}
          </div>
        </article>
      </section>

      {toast ? <Toast variant="success" message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
