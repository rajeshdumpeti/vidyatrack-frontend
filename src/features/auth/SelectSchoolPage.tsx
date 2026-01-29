import { useNavigate } from "react-router-dom";
import { HiAcademicCap } from "react-icons/hi2";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/utils/logger";

export function SelectSchoolPage() {
  const navigate = useNavigate();

  // Grab the list of schools and the action to set the active one
  const schools = useAuthStore((s) => s.schools);
  const setActiveSchool = useAuthStore((s) => s.setActiveSchool);

  const handleSelect = (schoolId: number) => {
    logger.info("[auth][select-school] school selected", { schoolId });

    // 1. Update the active school in Zustand and LocalStorage
    setActiveSchool(schoolId);

    // 2. Redirect to the management dashboard
    navigate("/management", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 mx-auto shadow-lg shadow-blue-600/20">
            <HiAcademicCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Select School
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Choose the institution you want to manage today.
          </p>
        </div>

        <div className="space-y-4">
          {schools.length > 0 ? (
            schools.map((school) => (
              <button
                key={school.id}
                onClick={() => handleSelect(school.id)}
                className="w-full flex items-center p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-blue-500 hover:ring-4 hover:ring-blue-50 transition-all group text-left"
              >
                <div className="bg-blue-50 p-3 rounded-xl mr-4 group-hover:bg-blue-100 transition-colors">
                  <HiAcademicCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">
                    {school.name}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                    Role: {school.role}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-sm text-gray-500">
                No schools found linked to your account.
              </p>
              <button
                onClick={() => navigate("/auth/login")}
                className="mt-4 text-blue-600 font-semibold text-sm"
              >
                Go back to Login
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Logged in as Management. You can switch schools later from the
          dashboard.
        </p>
      </div>
    </div>
  );
}
