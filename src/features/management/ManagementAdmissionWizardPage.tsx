import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getClasses } from "@/api/classes.api";
import { getSections } from "@/api/sections.api";
import { createStudent, getStudentProfile, updateStudent } from "@/api/students.api";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Toast } from "@/components/feedback/Toast";
import { useAuthStore } from "@/store/auth.store";

function phoneToE164(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("91") ? `+${digits}` : `+91${digits}`;
}

export function ManagementAdmissionWizardPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    class_id: "",
    section_id: "",
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    admission_date: new Date().toISOString().slice(0, 10),
    admission_number: "",
    parent_name: "",
    parent_phone: "",
    nationality: "India",
    religion: "",
    caste_category: "",
    mother_tongue: "",
    aadhaar_number: "",
    birth_cert_number: "",
    previous_school_name: "",
    previous_school_tc_number: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_relation: "",
    emergency_contact_phone: "",
  });

  const classesQuery = useQuery({
    queryKey: ["admission-wizard-classes", schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: Boolean(schoolId),
  });
  const sectionsQuery = useQuery({
    queryKey: ["admission-wizard-sections", schoolId],
    queryFn: () => getSections(schoolId!),
    enabled: Boolean(schoolId),
  });
  const profileQuery = useQuery({
    queryKey: ["admission-wizard-profile", schoolId, studentId],
    queryFn: () => getStudentProfile(studentId!, schoolId!),
    enabled: Boolean(schoolId && studentId),
  });

  const availableSections = useMemo(
    () => (sectionsQuery.data ?? []).filter((section) => String(section.class_id) === form.class_id),
    [sectionsQuery.data, form.class_id],
  );

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    const sectionRow = (sectionsQuery.data ?? []).find((section) => section.id === profile.section_id);
    const guardian = profile.guardians?.[0];
    setForm((prev) => ({
      ...prev,
      name: profile.name ?? "",
      date_of_birth: profile.personal_details?.date_of_birth ?? "",
      gender: profile.personal_details?.gender ?? "",
      blood_group: profile.personal_details?.blood_group ?? "",
      academic_year: profile.academic_year ?? prev.academic_year,
      class_id: sectionRow ? String(sectionRow.class_id) : prev.class_id,
      section_id: profile.section_id ? String(profile.section_id) : "",
      parent_name: guardian?.name ?? "",
      parent_phone: guardian?.phone ?? "",
      nationality: profile.personal_details?.nationality ?? "India",
      religion: profile.personal_details?.religion ?? "",
      caste_category: profile.personal_details?.caste_category ?? "",
      mother_tongue: profile.personal_details?.mother_tongue ?? "",
      aadhaar_number: profile.personal_details?.aadhaar_number ?? "",
      birth_cert_number: profile.personal_details?.birth_cert_number ?? "",
      address: profile.personal_details?.address ?? "",
      admission_number: profile.admission_number ?? "",
      previous_school_name: profile.previous_school_name ?? "",
      previous_school_tc_number: profile.previous_school_tc_number ?? "",
    }));
  }, [profileQuery.data, sectionsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) return null;
      const payload = {
        name: form.name,
        date_of_birth: form.date_of_birth || undefined,
        gender: form.gender || undefined,
        blood_group: form.blood_group || undefined,
        section_id: form.section_id ? Number(form.section_id) : undefined,
        academic_year: form.academic_year,
        admission_date: form.admission_date || undefined,
        admission_number: form.admission_number || undefined,
        parent_name: form.parent_name || undefined,
        parent_phone: phoneToE164(form.parent_phone),
        nationality: form.nationality || undefined,
        religion: form.religion || undefined,
        caste_category: form.caste_category || undefined,
        mother_tongue: form.mother_tongue || undefined,
        aadhaar_number: form.aadhaar_number || undefined,
        birth_cert_number: form.birth_cert_number || undefined,
        previous_school_name: form.previous_school_name || undefined,
        previous_school_tc_number: form.previous_school_tc_number || undefined,
        address: form.address || undefined,
        emergency_contact_name: form.emergency_contact_name || undefined,
        emergency_contact_relation: form.emergency_contact_relation || undefined,
        emergency_contact_phone: form.emergency_contact_phone ? phoneToE164(form.emergency_contact_phone) : undefined,
        status: "ACTIVE" as const,
      };
      if (studentId) {
        return updateStudent(studentId, payload, schoolId);
      }
      return createStudent(payload, schoolId);
    },
    onSuccess: () => {
      setToast("Admission saved");
      void queryClient.invalidateQueries({ queryKey: ["management-enrollment-students", schoolId] });
      void queryClient.invalidateQueries({ queryKey: ["management-students"] });
      setTimeout(() => navigate("/management/enrollment"), 500);
    },
  });

  if (profileQuery.isLoading || classesQuery.isLoading || sectionsQuery.isLoading) {
    return <LoadingState label="Loading admission wizard..." />;
  }
  if (profileQuery.isError || classesQuery.isError || sectionsQuery.isError) {
    return <ErrorState title="Unable to load admission wizard" message="Please retry." />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Enrollment Wizard</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              {studentId ? "Complete draft admission" : "Full student admission"}
            </h1>
          </div>
          <Link to="/management/enrollment" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
            Back
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Student full name</label>
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Academic year</label>
            <input value={form.academic_year} onChange={(e) => setForm((prev) => ({ ...prev, academic_year: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Date of birth</label>
            <input type="date" value={form.date_of_birth} onChange={(e) => setForm((prev) => ({ ...prev, date_of_birth: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Gender</label>
            <select value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Class</label>
            <select value={form.class_id} onChange={(e) => setForm((prev) => ({ ...prev, class_id: e.target.value, section_id: "" }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm">
              <option value="">Select class</option>
              {(classesQuery.data ?? []).map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Section</label>
            <select value={form.section_id} onChange={(e) => setForm((prev) => ({ ...prev, section_id: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm">
              <option value="">Select section</option>
              {availableSections.map((section) => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Admission date</label>
            <input type="date" value={form.admission_date} onChange={(e) => setForm((prev) => ({ ...prev, admission_date: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Admission number</label>
            <input value={form.admission_number} onChange={(e) => setForm((prev) => ({ ...prev, admission_number: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Parent name</label>
            <input value={form.parent_name} onChange={(e) => setForm((prev) => ({ ...prev, parent_name: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Parent phone</label>
            <input value={form.parent_phone} onChange={(e) => setForm((prev) => ({ ...prev, parent_phone: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Blood group</label>
            <input value={form.blood_group} onChange={(e) => setForm((prev) => ({ ...prev, blood_group: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Nationality</label>
            <input value={form.nationality} onChange={(e) => setForm((prev) => ({ ...prev, nationality: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Religion</label>
            <input value={form.religion} onChange={(e) => setForm((prev) => ({ ...prev, religion: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Caste category</label>
            <input value={form.caste_category} onChange={(e) => setForm((prev) => ({ ...prev, caste_category: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Mother tongue</label>
            <input value={form.mother_tongue} onChange={(e) => setForm((prev) => ({ ...prev, mother_tongue: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Aadhaar number</label>
            <input value={form.aadhaar_number} onChange={(e) => setForm((prev) => ({ ...prev, aadhaar_number: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Birth certificate number</label>
            <input value={form.birth_cert_number} onChange={(e) => setForm((prev) => ({ ...prev, birth_cert_number: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Previous school</label>
            <input value={form.previous_school_name} onChange={(e) => setForm((prev) => ({ ...prev, previous_school_name: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Previous school TC</label>
            <input value={form.previous_school_tc_number} onChange={(e) => setForm((prev) => ({ ...prev, previous_school_tc_number: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
        </div>
        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-700">Address</label>
          <textarea value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-slate-700">Emergency contact name</label>
            <input value={form.emergency_contact_name} onChange={(e) => setForm((prev) => ({ ...prev, emergency_contact_name: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Emergency relation</label>
            <input value={form.emergency_contact_relation} onChange={(e) => setForm((prev) => ({ ...prev, emergency_contact_relation: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Emergency phone</label>
            <input value={form.emergency_contact_phone} onChange={(e) => setForm((prev) => ({ ...prev, emergency_contact_phone: e.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !form.name || !form.section_id || !form.parent_phone}
            className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saveMutation.isPending ? "Saving..." : studentId ? "Complete Admission" : "Create Admission"}
          </button>
        </div>
      </section>

      {toast ? <Toast variant="success" message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
