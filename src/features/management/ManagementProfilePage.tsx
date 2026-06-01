import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarRange, Landmark, Mail, MapPinned, Phone, ShieldCheck, UserCircle2 } from "lucide-react";

import { getManagementSchoolProfile, updateManagementSchoolProfile } from "@/api/managementSetup.api";
import { useAuthStore } from "@/store/auth.store";

export function ManagementProfilePage() {
  const schoolId = useAuthStore((state) => state.schoolId);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["management-school-profile", schoolId],
    queryFn: () => getManagementSchoolProfile(schoolId!),
    enabled: Boolean(schoolId),
  });

  const school = query.data;
  const [form, setForm] = useState({
    board: "",
    category: "",
    medium: "",
    school_type: "",
    established_year: "",
    current_session: "",
    working_days_per_week: "",
    academic_start_month: "",
    academic_end_month: "",
    class_levels: "",
    street: "",
    area: "",
    city: "",
    district: "",
    state: "",
    pin_code: "",
    country: "India",
    landmark: "",
    school_phone: "",
    school_email: "",
    website: "",
  });

  useEffect(() => {
    if (!school) return;
    setForm({
      board: school.board ?? "",
      category: school.category ?? "",
      medium: school.medium ?? "",
      school_type: school.school_type ?? "",
      established_year: school.established_year ? String(school.established_year) : "",
      current_session: school.current_session ?? "",
      working_days_per_week: school.working_days_per_week ? String(school.working_days_per_week) : "",
      academic_start_month: school.academic_start_month ? String(school.academic_start_month) : "",
      academic_end_month: school.academic_end_month ? String(school.academic_end_month) : "",
      class_levels: school.class_levels?.join(", ") ?? "",
      street: school.street ?? "",
      area: school.area ?? "",
      city: school.city ?? "",
      district: school.district ?? "",
      state: school.state ?? "",
      pin_code: school.pin_code ?? "",
      country: school.country ?? "India",
      landmark: school.landmark ?? "",
      school_phone: school.school_phone ?? "",
      school_email: school.school_email ?? "",
      website: school.website ?? "",
    });
  }, [school]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateManagementSchoolProfile(schoolId!, {
        board: form.board || null,
        category: form.category || null,
        medium: form.medium || null,
        school_type: form.school_type || null,
        established_year: form.established_year ? Number(form.established_year) : null,
        current_session: form.current_session || null,
        working_days_per_week: form.working_days_per_week ? Number(form.working_days_per_week) : null,
        academic_start_month: form.academic_start_month ? Number(form.academic_start_month) : null,
        academic_end_month: form.academic_end_month ? Number(form.academic_end_month) : null,
        class_levels: form.class_levels
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        street: form.street || null,
        area: form.area || null,
        city: form.city || null,
        district: form.district || null,
        state: form.state || null,
        pin_code: form.pin_code || null,
        country: form.country || null,
        landmark: form.landmark || null,
        school_phone: form.school_phone || null,
        school_email: form.school_email || null,
        website: form.website || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["management-school-profile", schoolId] });
      await queryClient.invalidateQueries({ queryKey: ["management-setup-status", schoolId] });
    },
  });

  const locationParts = [
    school?.street,
    school?.area,
    school?.city,
    school?.district,
    school?.state,
    school?.pin_code,
    school?.country,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <UserCircle2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              School Profile
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              {school?.school_name || "School"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Identity, contact, academic session, and enabled modules for this school.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">School Identity</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span>Code: {school?.school_code || "Not set"}</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              <span>{[school?.board, school?.category, school?.medium].filter(Boolean).join(" | ") || "Board/category not set"}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarRange className="h-4 w-4 text-slate-500" />
              <span>
                Session: {school?.current_session || "Not set"}
                {school?.established_year ? ` | Est. ${school.established_year}` : ""}
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Contact</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-500" />
              <span>{school?.school_phone || "No school phone available"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-500" />
              <span>{school?.school_email || "No school email available"}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPinned className="h-4 w-4 text-slate-500" />
              <span>{locationParts.length ? locationParts.join(", ") : "Address not available"}</span>
            </div>
            {school?.landmark ? (
              <div className="flex items-center gap-3">
                <Landmark className="h-4 w-4 text-slate-500" />
                <span>{school.landmark}</span>
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Academic Setup</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <CalendarRange className="h-4 w-4 text-slate-500" />
              <span>
                Months: {school?.academic_start_month || "-"} to {school?.academic_end_month || "-"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              <span>Working days/week: {school?.working_days_per_week || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span>
                Grades: {school?.class_levels?.length ? school.class_levels.join(", ") : "Not available"}
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Enabled Modules</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(school?.modules_enabled ?? []).length ? (
              school!.modules_enabled.map((module) => (
                <span
                  key={module}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700"
                >
                  {module}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">No module data available</span>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-black text-slate-900">Edit School Profile</h2>
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {saveMutation.isPending ? "Saving..." : "Save profile"}
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            ["board", "Board"],
            ["category", "Category"],
            ["medium", "Medium"],
            ["school_type", "School Type"],
            ["established_year", "Established Year"],
            ["current_session", "Current Session"],
            ["working_days_per_week", "Working Days / Week"],
            ["academic_start_month", "Academic Start Month"],
            ["academic_end_month", "Academic End Month"],
            ["school_phone", "School Phone"],
            ["school_email", "School Email"],
            ["website", "Website"],
            ["street", "Street"],
            ["area", "Area"],
            ["city", "City"],
            ["district", "District"],
            ["state", "State"],
            ["pin_code", "Pin Code"],
            ["country", "Country"],
            ["landmark", "Landmark"],
            ["class_levels", "Grades (comma separated)"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
        {saveMutation.isError ? (
          <p className="mt-4 text-sm text-rose-600">Unable to save school profile.</p>
        ) : null}
        {saveMutation.isSuccess ? (
          <p className="mt-4 text-sm font-semibold text-emerald-700">
            School profile saved. Checklist status refreshes automatically.
          </p>
        ) : null}
      </section>
    </div>
  );
}
