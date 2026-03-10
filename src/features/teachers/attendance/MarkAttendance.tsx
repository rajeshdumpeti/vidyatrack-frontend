import { LoadingState } from "@/components/feedback/LoadingState";
import { TeacherFeatureTopBar } from "@/components/teachers/TeacherFeatureTopBar";
import { AttendanceSubmitModal } from "@/features/teachers/attendance/AttendanceSubmitModal";

import { MarkAttendanceContextBar } from "./markAttendance/components/MarkAttendanceContextBar";
import { MarkAttendanceStudentTable } from "./markAttendance/components/MarkAttendanceStudentTable";
import { MarkAttendanceSummary } from "./markAttendance/components/MarkAttendanceSummary";
import { useMarkAttendancePage } from "./markAttendance/hooks/useMarkAttendancePage";

export function MarkAttendance() {
  const attendancePage = useMarkAttendancePage();

  if (
    attendancePage.sectionLoading ||
    attendancePage.studentsLoading ||
    attendancePage.attendanceLoading
  ) {
    return <LoadingState label="Loading students..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-10">
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <TeacherFeatureTopBar pageLabel="Attendance Entry" />

        <h1 className="mb-6 text-2xl font-extrabold text-gray-900 md:mb-8 md:text-3xl">
          Mark Attendance
        </h1>

        <MarkAttendanceContextBar
          className={attendancePage.className}
          subjectName={attendancePage.subjectName}
          sectionName={attendancePage.sectionName}
        />

        <MarkAttendanceStudentTable
          students={attendancePage.students}
          presentById={attendancePage.presentById}
          isReadOnly={attendancePage.isReadOnly}
          onToggleStatus={attendancePage.toggleStatus}
          pagination={attendancePage.pagination}
        />

        <MarkAttendanceSummary
          counts={attendancePage.counts}
          isSubmitting={attendancePage.isSubmitting}
          isReadOnly={attendancePage.isReadOnly}
          onSubmit={attendancePage.submitAttendance}
        />

        <AttendanceSubmitModal
          isSubmitting={attendancePage.isSubmitting}
          submitSuccess={attendancePage.submitSuccess}
          submitError={attendancePage.submitError}
          sectionLabel={attendancePage.sectionLabel}
          redirectCountdown={attendancePage.redirectCountdown}
          onSubmit={attendancePage.submitAttendance}
          onClose={() => attendancePage.resetSubmitError?.()}
          onReturnHome={attendancePage.navigateHome}
        />
      </div>
    </div>
  );
}
