type TeacherProfileAssignmentsCardProps = {
  primarySection: string | null;
  assignmentLabels: string[];
};

export function TeacherProfileAssignmentsCard({
  primarySection,
  assignmentLabels,
}: TeacherProfileAssignmentsCardProps) {
  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-lg font-extrabold tracking-tight text-gray-900">
          Primary Attendance Section
        </div>
        {primarySection ? (
          <>
            <div className="mt-2 text-sm font-semibold text-gray-800">
              {primarySection}
            </div>
            <div className="mt-1 text-xs font-medium text-gray-500">
              Used for attendance ownership and default class context.
            </div>
          </>
        ) : (
          <div className="mt-2 text-sm font-semibold text-gray-500">
            Not assigned
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-lg font-extrabold tracking-tight text-gray-900">
          Subject Assignments
        </div>
        {assignmentLabels.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {assignmentLabels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                {label}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-sm font-semibold text-gray-500">
            No subject assignments found.
          </div>
        )}
      </div>
    </>
  );
}
