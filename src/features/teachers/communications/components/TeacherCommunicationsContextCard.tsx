import { BookOpen, Users } from "lucide-react";

type TeacherCommunicationsContextCardProps = {
  assignmentClassLabel: string;
  assignmentSectionLabel: string;
  assignmentSubjectLabel: string;
  studentsCount: number;
};

export function TeacherCommunicationsContextCard({
  assignmentClassLabel,
  assignmentSectionLabel,
  assignmentSubjectLabel,
  studentsCount,
}: TeacherCommunicationsContextCardProps) {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-900">
            Class & Subject
          </label>
          <div className="mt-3 flex items-center gap-3 rounded-xl">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {assignmentClassLabel}
            {assignmentSectionLabel ? ` - ${assignmentSectionLabel}` : ""}
            {assignmentSubjectLabel ? ` • ${assignmentSubjectLabel}` : ""}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Messages and homework are sent to the selected class & subject.
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Students
          </label>
          <div className="mt-3 flex items-center gap-3 rounded-xl">
            <Users className="h-5 w-5 text-blue-600" />
            <div className="text-sm font-semibold text-gray-900">
              {studentsCount} enrolled
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Only students in this section are available.
          </p>
        </div>
      </div>
    </div>
  );
}
