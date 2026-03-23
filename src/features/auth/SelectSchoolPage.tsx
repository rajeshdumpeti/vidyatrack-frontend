import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiAcademicCap, HiMagnifyingGlass } from "react-icons/hi2";
import { getAuthMe } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/utils/logger";

export function SelectSchoolPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Grab the list of schools and the action to set the active one
  const schools = useAuthStore((s) => s.schools);
  const schoolsLoaded = useAuthStore((s) => s.schoolsLoaded);
  const setSchools = useAuthStore((s) => s.setSchools);
  const setActiveSchool = useAuthStore((s) => s.setActiveSchool);
  const accessToken = useAuthStore((s) => s.accessToken);

  // If schools haven't been loaded yet (e.g. page refresh or direct navigation),
  // re-fetch from /auth/me so the list is always populated.
  useEffect(() => {
    if (schoolsLoaded || isFetching) return;
    if (!accessToken) {
      navigate("/auth/login", { replace: true });
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFetching(true);
    setFetchError(null);

    getAuthMe()
      .then((me) => {
        setSchools(Array.isArray(me.schools) ? me.schools : []);
      })
      .catch((err) => {
        logger.error("[auth][select-school] failed to load schools", { err });
        setFetchError("Could not load your schools. Please try again.");
      })
      .finally(() => setIsFetching(false));
  }, [schoolsLoaded, isFetching, accessToken, navigate, setSchools]);

  // Auto-select and redirect if user has exactly one school
  useEffect(() => {
    if (!schoolsLoaded || isFetching) return;
    if (schools.length !== 1) return;
    setActiveSchool(schools[0].id);
    navigate("/management", { replace: true });
  }, [schoolsLoaded, isFetching, schools, setActiveSchool, navigate]);

  // Filter schools based on search query (case-insensitive name match)
  const filteredSchools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter((s) => s.name.toLowerCase().includes(q));
  }, [schools, searchQuery]);

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

        {/* Loading state while fetching schools */}
        {isFetching && (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          </div>
        )}

        {/* Fetch error */}
        {fetchError && !isFetching && (
          <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-200">
            <p className="text-sm text-red-600">{fetchError}</p>
            <button
              onClick={() => {
                setIsFetching(false);
              }}
              className="mt-3 text-blue-600 font-semibold text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search input — shown only when there are schools to filter */}
        {!isFetching && schools.length > 1 && (
          <div className="relative mb-4">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search schools…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        )}

        {/* Scrollable school card list — max 5 cards visible, then scroll */}
        {!isFetching && !fetchError && (
          <div className="max-h-[420px] overflow-y-auto space-y-4 pr-1">
            {schools.length > 0 ? (
              filteredSchools.length > 0 ? (
                filteredSchools.map((school) => (
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
                    No schools match "{searchQuery}".
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-blue-600 font-semibold text-sm"
                  >
                    Clear search
                  </button>
                </div>
              )
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
        )}

        {/* School count hint */}
        {!isFetching && schools.length > 0 && (
          <p className="mt-3 text-center text-xs text-gray-400">
            {filteredSchools.length} of {schools.length} school
            {schools.length !== 1 ? "s" : ""}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Logged in as Management. You can switch schools later from the
          dashboard.
        </p>
      </div>
    </div>
  );
}
