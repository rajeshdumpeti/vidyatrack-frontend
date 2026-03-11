import { HiOutlineAcademicCap } from "react-icons/hi2";

type TeacherDashboardHeaderProps = {
  teacherName: string;
};

export function TeacherDashboardHeader({
  teacherName,
}: TeacherDashboardHeaderProps) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
        <HiOutlineAcademicCap className="h-5 w-5" />
        Welcome {teacherName}!
      </div>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
        Have a great day of teaching!
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Your next actions are ready below.
      </p>
    </div>
  );
}
