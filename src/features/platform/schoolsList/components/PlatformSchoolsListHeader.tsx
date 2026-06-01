import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

export function PlatformSchoolsListHeader({ schoolCount }: { schoolCount: number }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
        <p className="text-sm text-gray-500">
          Manage {schoolCount} active pilot institutions
        </p>
      </div>
      <Link
        to="/superadmin/schools/add"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-100 transition-transform active:scale-95"
      >
        <Plus className="h-5 w-5" />
        Add School
      </Link>
    </div>
  );
}
