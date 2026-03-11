import { EmptyState } from "@/components/feedback/EmptyState";
import type { StudentGuardian } from "@/types/student.types";
import { Phone } from "lucide-react";

import { formatValue } from "../utils/studentProfile.utils";

export function StudentProfileGuardiansCard({
  guardians,
}: {
  guardians: StudentGuardian[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-bold text-gray-900">
        <Phone className="mr-2 inline h-4 w-4 text-slate-600" />
        Guardian Contact
      </div>
      <div className="mt-4 space-y-3">
        {guardians.length === 0 ? (
          <EmptyState message="No guardians listed." />
        ) : (
          guardians.map((guardian, index) => (
            <div
              key={`${guardian.name ?? "guardian"}-${index}`}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <div className="text-sm font-semibold text-gray-900">
                {formatValue(guardian.name)}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {formatValue(guardian.relation)}
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                {guardian.phone ? (
                  <a
                    href={`tel:${guardian.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    {guardian.phone}
                  </a>
                ) : (
                  formatValue(guardian.phone)
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
