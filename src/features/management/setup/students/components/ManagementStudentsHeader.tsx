type ManagementStudentsHeaderProps = {
  onImport: () => void;
  onAdd: () => void;
  onExport: () => void;
};

export function ManagementStudentsHeader({
  onImport,
  onAdd,
  onExport,
}: ManagementStudentsHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Students</h1>
        <div className="text-sm text-gray-600">
          Enroll students into sections after classes and sections are ready.
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onExport}
        >
          Export CSV
        </button>
        <button
          type="button"
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onImport}
        >
          Import Students
        </button>
        <button
          type="button"
          className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          onClick={onAdd}
        >
          + Add Student
        </button>
      </div>
    </div>
  );
}
