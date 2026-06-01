export function TeachersListHeader({
  isManagement,
  onAddTeacher,
  onExport,
}: {
  isManagement: boolean;
  onAddTeacher: () => void;
  onExport?: () => void;
}) {
  return (
    <header className="px-4 pt-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Teacher Directory
            </h1>
            <p className="mt-2 text-sm font-medium text-gray-600">
              Manage teaching staff access and assignments.
            </p>
          </div>
          {isManagement ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-10 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={onExport}
              >
                Export CSV
              </button>
              <button
                type="button"
                className="h-10 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={onAddTeacher}
              >
                + Add Teacher
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
