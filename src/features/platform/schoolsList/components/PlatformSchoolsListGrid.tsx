import { ArrowRight, GraduationCap, School, Users } from "lucide-react";
import { Link } from "react-router-dom";

import type { SchoolDto } from "@/types/school.types";

type PlatformSchoolsListGridProps = {
  schools: SchoolDto[];
  fallbackBySchoolId: Map<number, { teacher: number; student: number }>;
};

export function PlatformSchoolsListGrid({
  schools,
  fallbackBySchoolId,
}: PlatformSchoolsListGridProps) {
  return (
    <div className="grid gap-3">
      {schools.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
          <School className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">No schools found matching your search.</p>
        </div>
      ) : (
        schools.map((school) => (
          <Link
            key={school.id}
            to={`/platform/schools/${school.id}?tab=overview`}
            className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-blue-200"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-blue-50 font-bold text-gray-900 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                {school.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{school.name}</h3>
                <div className="mt-1 flex gap-3">
                  <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                    <Users className="h-3 w-3" />
                    {school.teacher_count ??
                      fallbackBySchoolId.get(school.id)?.teacher ??
                      0}{" "}
                    Teachers
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-500">
                    <GraduationCap className="h-3 w-3" />
                    {school.student_count ??
                      fallbackBySchoolId.get(school.id)?.student ??
                      0}{" "}
                    Students
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-mono text-gray-400">ID: {school.id}</p>
              <span className="p-2 text-gray-300 transition-colors group-hover:text-gray-900">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
