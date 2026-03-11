type SchoolOption = {
  id: number;
  name: string;
  role: string;
};

export function ManagementDashboardHeader({
  schools,
  activeSchool,
  title,
  subtitle,
  onSwitchSchools,
}: {
  schools: SchoolOption[];
  activeSchool: SchoolOption | null;
  title: string;
  subtitle: string;
  onSwitchSchools: () => void;
}) {
  return (
    <>
      {schools.length > 1 ? (
        <div className="flex justify-center space-y-2">
          <label htmlFor="school-switch" className="mr-4 ">
            {activeSchool?.name}
          </label>
          <button
            type="button"
            className="text-blue-600 underline hover:text-blue-700"
            onClick={onSwitchSchools}
          >
            Switch Schools
          </button>
        </div>
      ) : null}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500">{subtitle}</p>
        </div>
      </header>
    </>
  );
}
