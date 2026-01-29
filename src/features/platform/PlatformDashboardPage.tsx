import { Link } from "react-router-dom";
import { School, PlusCircle, Activity } from "lucide-react";

export function PlatformDashboardPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
          <Activity className="h-4 w-4" /> SUPER_ADMIN Session Active
        </p>
      </header>

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

      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-xs text-gray-400 text-center uppercase tracking-widest font-semibold">
          Pilot Phase: Observation Mode
        </p>
      </div>
    </div>
  );
}
