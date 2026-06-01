import { useNavigate, useParams } from "react-router-dom";

import { InsightState } from "@/components/feedback/InsightState";

export function PlatformSchoolConsolePlaceholderPage({ title }: { title: string }) {
  const navigate = useNavigate();
  const { schoolId } = useParams();
  const safeSchoolId = (schoolId || "").trim();

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <button
        type="button"
        onClick={() => navigate(`/superadmin/schools/${safeSchoolId}`)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        Back to School Overview
      </button>

      <InsightState title={title} description="Coming soon in Super Admin school console." />
    </div>
  );
}

