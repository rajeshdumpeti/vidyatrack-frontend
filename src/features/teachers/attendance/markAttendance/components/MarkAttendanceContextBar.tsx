type MarkAttendanceContextBarProps = {
  className: string;
  subjectName: string;
  sectionName: string;
};

export function MarkAttendanceContextBar({
  className,
  subjectName,
  sectionName,
}: MarkAttendanceContextBarProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2 text-[13px] font-bold text-gray-600 md:gap-4 md:text-sm">
      <div className="flex items-center gap-2 rounded-lg px-3 py-1.5">
        <span className="text-grey-600">■</span>
        <span className="hidden md:inline">Class</span> {className}
      </div>
      <div className="items-center gap-2 rounded-lg px-2 py-1.5 md:flex">
        <span className="text-grey-600">✎</span> {subjectName}
      </div>
      <div className="flex items-center gap-2 rounded-lg px-3 py-1.5">
        <span className="text-grey-600 md:text-grey-600">⏺</span>
        <span className="hidden md:inline">Section</span> {sectionName}
      </div>
    </div>
  );
}
