import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid,
  Users,
  GraduationCap,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";
import { useManagementPrincipal } from "@/hooks/useManagementPrincipal";
import { getManagementDashboardCmsContent } from "@/cms";
import {
  MANAGEMENT_DASHBOARD_DEFAULTS,
  type ManagementDashboardCmsContent,
} from "@/cms";

const CMS_ENABLED = false;

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
  const principalQuery = useManagementPrincipal();
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
    console.log("", canonicalCode);

    const currentCode = schoolCodeParam?.trim().toLowerCase() ?? "";

    if (!canonicalCode || currentCode === canonicalCode) return;

    const next = new URLSearchParams(searchParams);
    setSearchParams(next, { replace: true });
  }, [activeSchool, schoolCodeParam, searchParams, setSearchParams]);
  useEffect(() => {
    if (!CMS_ENABLED) return;
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
    <div className="max-w-5xl mx-auto">
      {schools.length > 1 ? (
        <div className="space-y-2 flex justify-center ">
          <label htmlFor="school-switch" className="mr-4 ">
            {activeSchool?.name}
          </label>
          <a
            className="text-blue-600 hover:text-blue-700 underline"
            onClick={() => navigate("/auth/select-school")}
          >
            Switch Schools
          </a>
        </div>
      ) : null}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {cmsContent.dashboardTitle}
          </h1>
          <p className="text-gray-500">{cmsContent.dashboardSubtitle}</p>
        </div>
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

      <div className="mt-6">
        <Link
          to="/management/principals"
          className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Principal Onboarding Status
              </div>
              <p className="mt-3 text-base font-bold text-slate-900">
                {principalQuery.isLoading
                  ? "Checking principal assignment..."
                  : principalQuery.data
                    ? `Assigned: ${principalQuery.data.name}`
                    : "No principal assigned yet"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {principalQuery.data
                  ? "Tap to update principal details or resend OTP."
                  : "Tap to register and assign principal for OTP login."}
              </p>
            </div>
            <span
              className={[
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                principalQuery.data
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700",
              ].join(" ")}
            >
              {principalQuery.data ? "Configured" : "Pending"}
            </span>
          </div>
        </Link>
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
