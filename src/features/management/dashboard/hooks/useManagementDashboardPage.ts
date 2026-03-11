import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  GraduationCap,
  LayoutGrid,
  Users,
} from "lucide-react";

import { getManagementDashboardCmsContent } from "@/cms";
import {
  MANAGEMENT_DASHBOARD_DEFAULTS,
  type ManagementDashboardCmsContent,
} from "@/cms";
import { useManagementPrincipal } from "@/hooks/useManagementPrincipal";
import { useAuthStore } from "@/store/auth.store";

import {
  resolveSchoolByCode,
  slugifySchoolName,
} from "../helpers/managementDashboard.helpers";

const CMS_ENABLED = false;

export function useManagementDashboardPage() {
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
      icon: LayoutGrid,
      iconClassName: "h-6 w-6 text-purple-600",
      color: "bg-purple-50",
    },
    {
      title: cmsContent.quickLink2Label,
      desc: "Create accounts for the Principal and your Teaching staff.",
      link: cmsContent.quickLink2Url,
      icon: Users,
      iconClassName: "h-6 w-6 text-blue-600",
      color: "bg-blue-50",
    },
    {
      title: "Student Enrollment",
      desc: "Register students and assign them to their respective sections.",
      link: "/management/setup/students",
      icon: GraduationCap,
      iconClassName: "h-6 w-6 text-green-600",
      color: "bg-green-50",
    },
  ];

  return {
    schools,
    activeSchool,
    cmsContent,
    principalQuery,
    steps,
    onSwitchSchools: () => navigate("/auth/select-school"),
  };
}
