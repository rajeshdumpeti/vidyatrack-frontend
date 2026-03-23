import { Link } from "react-router-dom";
import { School, PlusCircle, Activity, Users, GraduationCap } from "lucide-react";
import { useMemo } from "react";
import { useSchools } from "@/hooks/useSchools";
import { InsightState } from "@/components/feedback/InsightState";

export function PlatformDashboardPage() {
  const { list } = useSchools();
  const metrics = useMemo(() => {
    const schools = list.data?.data ?? [];
    return schools.reduce(
      (acc, school) => {
        acc.schools += 1;
        acc.teachers += school.teacher_count ?? 0;
        acc.students += school.student_count ?? 0;
        return acc;
      },
      { schools: 0, teachers: 0, students: 0 },
    );
  }, [list.data]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
          <Activity className="h-4 w-4" /> SUPER_ADMIN Session Active
        </p>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Active Schools
          </div>
          <div className="mt-2 text-3xl font-extrabold text-blue-900">
            {metrics.schools}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Registered Teachers
          </div>
          <div className="mt-2 flex items-center gap-2 text-3xl font-extrabold text-emerald-900">
            <Users className="h-6 w-6" />
            {metrics.teachers}
          </div>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
            Registered Students
          </div>
          <div className="mt-2 flex items-center gap-2 text-3xl font-extrabold text-indigo-900">
            <GraduationCap className="h-6 w-6" />
            {metrics.students}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/platform/schools"
          className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
        >
          <div className="bg-blue-50 p-3 rounded-xl">
            <School className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Manage Schools</h3>
            <p className="text-sm text-gray-500 mt-1">
              View and monitor your {new Date().getFullYear()} pilot schools.
            </p>
          </div>
        </Link>

        <Link
          to="/platform/schools/new"
          className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
        >
          <div className="bg-green-50 p-3 rounded-xl">
            <PlusCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Onboard School</h3>
            <p className="text-sm text-gray-500 mt-1">
              Register a new institution to the Vidyatrack platform.
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <InsightState
          title="Pilot Phase: Observation Mode"
          description="This workspace is optimized for real-time visibility. Open any school to monitor teachers, students, and staff coverage in one place."
        />
      </div>
    </div>
  );
}
