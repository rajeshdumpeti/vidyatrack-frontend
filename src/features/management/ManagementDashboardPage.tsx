import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Users, GraduationCap, ClipboardCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";
import { getManagementDashboardCmsContent } from "@/cms";
import {
  MANAGEMENT_DASHBOARD_DEFAULTS,
  type ManagementDashboardCmsContent,
} from "@/cms";

type SchoolOption = {
  id: number;
  name: string;
  role: string;
};

function slugifySchoolName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveSchoolByCode(
  schools: SchoolOption[],
  schoolCode: string | null,
): SchoolOption | null {
  if (!schoolCode) return null;
  const raw = schoolCode.trim().toLowerCase();
  if (!raw) return null;

  const byId = Number(raw);
  if (Number.isFinite(byId) && byId > 0) {
    const matchedById = schools.find((school) => school.id === byId);
    if (matchedById) return matchedById;
  }

  const matchedBySlug = schools.find(
    (school) => slugifySchoolName(school.name) === raw,
  );
  if (matchedBySlug) return matchedBySlug;

  const matchedByName = schools.find(
    (school) => school.name.trim().toLowerCase() === raw,
  );
  if (matchedByName) return matchedByName;

  return null;
}

export function ManagementDashboardPage() {
  const navigate = useNavigate();
  const schools = useAuthStore((state) => state.schools);
  const schoolId = useAuthStore((state) => state.schoolId);
  const setActiveSchool = useAuthStore((state) => state.setActiveSchool);

  const [searchParams, setSearchParams] = useSearchParams();
  const schoolCodeParam =
    searchParams.get("school_code") ?? searchParams.get("school");

  const schoolFromQuery = useMemo(
    () => resolveSchoolByCode(schools, schoolCodeParam),
    [schools, schoolCodeParam],
  );

  const effectiveSchoolId = schoolFromQuery?.id ?? schoolId ?? null;
  const activeSchool =
    schools.find((school) => school.id === effectiveSchoolId) ?? null;

  const [cmsContent, setCmsContent] = useState<ManagementDashboardCmsContent>(
    MANAGEMENT_DASHBOARD_DEFAULTS,
  );

  useEffect(() => {
    if (!schoolFromQuery || schoolFromQuery.id === schoolId) return;
    setActiveSchool(schoolFromQuery.id);
  }, [schoolFromQuery, schoolId, setActiveSchool]);

  useEffect(() => {
    if (!activeSchool) return;

    const canonicalCode = slugifySchoolName(activeSchool.name);
    const currentCode = schoolCodeParam?.trim().toLowerCase() ?? "";

    if (!canonicalCode || currentCode === canonicalCode) return;

    const next = new URLSearchParams(searchParams);
    next.set("school_code", canonicalCode);
    setSearchParams(next, { replace: true });
  }, [activeSchool, schoolCodeParam, searchParams, setSearchParams]);

  useEffect(() => {
    let isMounted = true;

    const loadCms = async () => {
      try {
        const cmsSchoolCode =
          schoolFromQuery?.name ??
          activeSchool?.name ??
          (schoolCodeParam?.trim() || undefined);

        const content = await getManagementDashboardCmsContent({
          schoolCode: cmsSchoolCode,
          schoolId: effectiveSchoolId,
        });
        if (!isMounted) return;
        setCmsContent(content);
      } catch {
        if (!isMounted) return;
        setCmsContent(MANAGEMENT_DASHBOARD_DEFAULTS);
      }
    };

    void loadCms();

    return () => {
      isMounted = false;
    };
  }, [activeSchool, effectiveSchoolId, schoolCodeParam, schoolFromQuery]);

  const steps = [
    {
      title: cmsContent.quickLink1Label,
      desc: "Define your Classes and Sections for the current session.",
      link: cmsContent.quickLink1Url,
      icon: <LayoutGrid className="h-6 w-6 text-purple-600" />,
      color: "bg-purple-50",
    },
    {
      title: cmsContent.quickLink2Label,
      desc: "Create accounts for the Principal and your Teaching staff.",
      link: cmsContent.quickLink2Url,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      title: "Student Enrollment",
      desc: "Register students and assign them to their respective sections.",
      link: "/management/setup/students",
      icon: <GraduationCap className="h-6 w-6 text-green-600" />,
      color: "bg-green-50",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {cmsContent.dashboardTitle}
          </h1>
          <p className="text-gray-500">{cmsContent.dashboardSubtitle}</p>
        </div>

        {schools.length > 1 ? (
          <div className="space-y-2">
            <label
              htmlFor="school-switch"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Active School
            </label>
            <select
              id="school-switch"
              className="h-10 min-w-64 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900"
              value={effectiveSchoolId ?? ""}
              onChange={(event) => {
                const nextSchoolId = Number(event.target.value);
                if (!Number.isFinite(nextSchoolId) || nextSchoolId <= 0) return;

                setActiveSchool(nextSchoolId);
                const selectedSchool = schools.find(
                  (school) => school.id === nextSchoolId,
                );

                const next = new URLSearchParams(searchParams);
                if (selectedSchool) {
                  next.set(
                    "school_code",
                    slugifySchoolName(selectedSchool.name),
                  );
                } else {
                  next.delete("school_code");
                }
                setSearchParams(next);
              }}
            >
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => navigate("/auth/select-school")}
              className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              Switch Schools
            </button>
          </div>
        ) : null}
      </header>

      {cmsContent.heroImageUrl ? (
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <img
            src={cmsContent.heroImageUrl}
            alt="Management dashboard banner"
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <Link
            key={step.title}
            to={step.link}
            className="group p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div
              className={`${step.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              {step.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-600 rounded-2xl text-white flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">{cmsContent.welcomeMessage}</h2>
          <p className="text-blue-100 text-sm">{cmsContent.announcementText}</p>
          <p className="mt-2 text-xs text-blue-200">
            {cmsContent.supportContactText}
          </p>
        </div>
        <ClipboardCheck className="h-12 w-12 text-blue-400 opacity-50 shrink-0" />
      </div>
    </div>
  );
}
