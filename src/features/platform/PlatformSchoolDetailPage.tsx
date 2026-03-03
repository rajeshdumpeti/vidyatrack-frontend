import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRightLeft,
  ShieldCheck,
  Users,
  Mail,
  Phone,
  UserCircle2,
} from "lucide-react";
import { useSchools } from "@/hooks/useSchools";
import { usePlatformSchoolDashboard } from "@/hooks/usePlatformSchoolDashboard";

type TabKey = "overview" | "teachers" | "students" | "staff";

type DashboardMetrics = {
  teachers: number;
  students: number;
  staff: number;
  total: number;
};

type PersonRow = {
  id: number;
  name: string;
  role?: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  extra?: string;
};

const VALID_TABS: TabKey[] = ["overview", "teachers", "students", "staff"];

function toTab(value: string | null): TabKey {
  if (value && VALID_TABS.includes(value as TabKey)) {
    return value as TabKey;
  }
  return "overview";
}

function getMockMetrics(schoolId: number): DashboardMetrics {
  const teachers = 48 + (schoolId % 7) * 3;
  const students = 680 + (schoolId % 6) * 45;
  const staff = 26 + (schoolId % 5) * 2;
  return {
    teachers,
    students,
    staff,
    total: teachers + students + staff,
  };
}

function getMockRows(
  kind: "teachers" | "students" | "staff",
  schoolId: number,
): PersonRow[] {
  if (kind === "teachers") {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `Teacher ${i + 1}`,
      role: "Teacher",
      email: `teacher${schoolId}${i + 1}@vidyatrack.school`,
      phone: `+91 90000${(1000 + schoolId * 7 + i).toString().slice(-5)}`,
      status: i % 5 === 0 ? "inactive" : "active",
      extra: i % 2 === 0 ? "Maths • Grade 8" : "Science • Grade 9",
    }));
  }

  if (kind === "students") {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i + 1,
      name: `Student ${i + 1}`,
      role: "Student",
      email: `student${schoolId}${i + 1}@vidyatrack.school`,
      phone: `+91 80000${(1000 + schoolId * 11 + i).toString().slice(-5)}`,
      status: "active",
      extra: i % 3 === 0 ? "Class 10 • Section A" : "Class 9 • Section B",
    }));
  }

  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Staff ${i + 1}`,
    role: i % 2 === 0 ? "Management" : "Support Staff",
    email: `staff${schoolId}${i + 1}@vidyatrack.school`,
    phone: `+91 70000${(1000 + schoolId * 13 + i).toString().slice(-5)}`,
    status: i % 6 === 0 ? "inactive" : "active",
    extra: i % 2 === 0 ? "Administration" : "Operations",
  }));
}

export function PlatformSchoolDetailPage() {
  const { schoolId: schoolIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const { list } = useSchools();

  const schoolId = Number(schoolIdParam);
  const safeSchoolId =
    Number.isFinite(schoolId) && schoolId > 0 ? schoolId : null;

  const activeTab = toTab(searchParams.get("tab"));
  const setActiveTab = (tab: TabKey) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next);
  };

  const school = useMemo(
    () => list.data?.find((item) => item.id === safeSchoolId) ?? null,
    [list.data, safeSchoolId],
  );

  const useMockData = false;
  const realData = usePlatformSchoolDashboard(
    useMockData ? null : safeSchoolId,
  );

  const metrics = useMemo<DashboardMetrics | null>(() => {
    if (!safeSchoolId) return null;
    if (useMockData) {
      return getMockMetrics(safeSchoolId);
    }
    const payload = realData.dashboard.data;
    if (!payload) return null;
    return {
      teachers: payload.teacher_count,
      students: payload.student_count,
      staff: payload.staff_count,
      total: payload.total_registered,
    };
  }, [safeSchoolId, useMockData, realData.dashboard.data]);

  const teachers = useMemo(() => {
    if (!safeSchoolId) return [];
    if (useMockData) return getMockRows("teachers", safeSchoolId);
    const list = realData.teachers.data ?? [];
    return list.map((item) => ({
      id: item.id,
      name: item.name,
      role: "Teacher",
      email: item.email ?? "-",
      phone: item.phone ?? "-",
      status: item.status,
      extra: "Teaching profile",
    }));
  }, [safeSchoolId, useMockData, realData.teachers.data]);

  const students = useMemo(() => {
    if (!safeSchoolId) return [];
    if (useMockData) return getMockRows("students", safeSchoolId);
    const list = realData.students.data ?? [];
    return list.map((item) => ({
      id: item.id,
      name: item.name,
      role: "Student",
      email: "-",
      phone: item.parent_phone ?? "-",
      status: item.status,
      extra: item.parent_name
        ? `Guardian: ${item.parent_name}`
        : "Guardian pending",
    }));
  }, [safeSchoolId, useMockData, realData.students.data]);

  const staff = useMemo(() => {
    if (!safeSchoolId) return [];
    if (useMockData) return getMockRows("staff", safeSchoolId);
    const list = realData.staff.data ?? [];
    return list.map((item) => ({
      id: item.user_id,
      name: item.name,
      role: item.role,
      email: item.email ?? "-",
      phone: item.phone ?? "-",
      status: item.status,
      extra: "Operational staff",
    }));
  }, [safeSchoolId, useMockData, realData.staff.data]);

  const filteredRows = useMemo(() => {
    const text = search.trim().toLowerCase();
    const source =
      activeTab === "teachers"
        ? teachers
        : activeTab === "students"
          ? students
          : staff;
    if (!text) return source;
    return source.filter(
      (row) =>
        row.name.toLowerCase().includes(text) ||
        row.email.toLowerCase().includes(text) ||
        row.phone.toLowerCase().includes(text),
    );
  }, [activeTab, teachers, students, staff, search]);

  if (!safeSchoolId) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-red-600 font-semibold">Invalid school id.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            to="/platform/schools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to School Directory
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {school?.name ?? `School #${safeSchoolId}`} Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Super admin observability view for users, enrollment and staff
            distribution.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide">
          <Activity className="h-4 w-4" />
          Live Pulse
        </div>
      </div>
      <div className="flex justify-end">
        <Link
          to="/platform/schools"
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700 hover:bg-blue-100"
        >
          <ArrowRightLeft className="h-4 w-4" />
          Switch Schools
        </Link>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Registered Teachers
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {metrics?.teachers ?? "-"}
          </div>
        </article>
        <article className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Registered Students
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {metrics?.students ?? "-"}
          </div>
        </article>
        <article className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            All Staff
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {metrics?.staff ?? "-"}
          </div>
        </article>
        <article className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Total Registered
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {metrics?.total ?? "-"}
          </div>
        </article>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pt-4">
          <div className="inline-flex p-1 bg-gray-100 rounded-xl">
            {VALID_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab !== "overview" ? (
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : null}
        </div>

        {activeTab === "overview" ? (
          <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs uppercase font-semibold text-blue-700">
                Teachers Mix
              </p>
              <p className="mt-1 text-sm text-blue-900">
                {metrics?.teachers ?? 0} registered teaching profiles mapped to
                this school.
              </p>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-xs uppercase font-semibold text-green-700">
                Enrollment
              </p>
              <p className="mt-1 text-sm text-green-900">
                {metrics?.students ?? 0} active students in current academic
                cycle.
              </p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs uppercase font-semibold text-amber-700">
                Staff Coverage
              </p>
              <p className="mt-1 text-sm text-amber-900">
                {metrics?.staff ?? 0} non-student, non-teacher staff linked to
                operations.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Role</th>
                    <th className="py-3 px-2">Contact</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Context</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr
                      key={`${activeTab}-${row.id}`}
                      className="border-b border-gray-50"
                    >
                      <td className="py-3 px-2 font-semibold text-gray-900">
                        {row.name}
                      </td>
                      <td className="py-3 px-2 text-gray-700">
                        {row.role ?? "-"}
                      </td>
                      <td className="py-3 px-2 text-gray-700">
                        <div>{row.email}</div>
                        <div>
                          {row.email !== "-" ? (
                            <a
                              href={`mailto:${row.email}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                            >
                              <Mail className="h-3 w-3" />
                              {row.email}
                            </a>
                          ) : (
                            <span>{row.email}</span>
                          )}
                        </div>
                        <div className="text-xs">
                          {row.phone !== "-" ? (
                            <a
                              href={`tel:${row.phone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              {row.phone}
                            </a>
                          ) : (
                            <span className="text-gray-500">{row.phone}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                            row.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {row.status === "active" ? (
                            <ShieldCheck className="h-3 w-3" />
                          ) : (
                            <Users className="h-3 w-3" />
                          )}
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {row.extra ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredRows.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <UserCircle2 className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                No matching records found.
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
