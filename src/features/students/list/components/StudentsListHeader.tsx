export function StudentsListHeader({ isTeacher }: { isTeacher: boolean }) {
  return (
    <header className="px-4 pt-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Student Directory
        </h1>
        <p className="mt-2 text-sm font-medium text-gray-600">
          {isTeacher
            ? "Students in your attendance section."
            : "View and manage student records across all classes."}
        </p>
      </div>
    </header>
  );
}
