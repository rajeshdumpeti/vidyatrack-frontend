export function AttendanceHistoryHeader() {
  return (
    <header className="px-4 pt-2">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Attendance Overview
        </h1>
        <p className="mt-2 text-sm font-medium text-gray-600">
          Read-only view of daily attendance metrics across classes.
        </p>
      </div>
    </header>
  );
}
