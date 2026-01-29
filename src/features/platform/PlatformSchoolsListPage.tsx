import { useSchools } from "@/hooks/useSchools";
import { Link } from "react-router-dom";
import {
  Plus,
  School,
  RefreshCcw,
  Search,
  Users,
  GraduationCap,
} from "lucide-react";
import { Activity } from "lucide-react";
import { useState } from "react";

export function PlatformSchoolsListPage() {
  const { list } = useSchools();
  const [search, setSearch] = useState("");

  const filteredSchools = list.data?.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (list.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCcw className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-gray-500 font-medium">Fetching pilot schools...</p>
      </div>
    );
  }

  if (list.isError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl mx-6 mt-6 border border-red-100">
        <p className="text-red-600 font-semibold">Could not load school list</p>
        <button
          onClick={() => list.refetch()}
          className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
          <p className="text-sm text-gray-500">
            Manage {list.data?.length || 0} active pilot institutions
          </p>
        </div>
        <Link
          to="/platform/schools/new"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add School
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by school name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {/* List */}
      <div className="grid gap-3">
        {!filteredSchools || filteredSchools.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <School className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No schools found matching your search.
            </p>
          </div>
        ) : (
          filteredSchools.map((school: any) => (
            <div
              key={school.id}
              className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {school.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{school.name}</h3>
                  <div className="flex gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                      <Users className="h-3 w-3" /> {school.teacher_count || 0}{" "}
                      Teachers
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-50 px-2 py-0.5 rounded-md">
                      <GraduationCap className="h-3 w-3" />{" "}
                      {school.student_count || 0} Students
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-mono text-gray-400">
                  ID: {school.id}
                </p>
                <button className="text-gray-300 hover:text-blue-600 p-2 transition-colors">
                  <Activity className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
