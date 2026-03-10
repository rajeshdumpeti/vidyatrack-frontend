import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";

import { StudentProfileGuardiansCard } from "./profile/components/StudentProfileGuardiansCard";
import { StudentProfileHeaderCard } from "./profile/components/StudentProfileHeaderCard";
import { StudentProfileNotesCard } from "./profile/components/StudentProfileNotesCard";
import {
  StudentAttendanceCard,
  StudentPersonalDetailsCard,
  StudentRecentResultsCard,
} from "./profile/components/StudentProfileOverviewCards";
import { useStudentProfilePage } from "./profile/hooks/useStudentProfilePage";

export function StudentProfilePage() {
  const page = useStudentProfilePage();

  if (!page.studentId) {
    return (
      <div className="px-4 py-6">
        <ErrorState title="Student not found" message="Invalid student ID." />
      </div>
    );
  }

  if (page.isLoading) {
    return <LoadingState label="Loading student information..." />;
  }

  if (page.hasError) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          title="Student not found"
          message="Unable to load student profile. Please check the student ID."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-2">
        <StudentProfileHeaderCard
          student={page.student}
          headerClassSection={page.headerClassSection}
          isGeneratingReport={page.isGeneratingReport}
          canGenerateReport={Boolean(page.effectiveSchoolId)}
          onGenerateReport={() => void page.generateReportCard()}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <StudentPersonalDetailsCard personal={page.personal} />
          <StudentAttendanceCard attendance={page.attendance} />
          <StudentRecentResultsCard
            groupedRecentResults={page.groupedRecentResults}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_2fr]">
          <StudentProfileGuardiansCard guardians={page.guardians} />
          <StudentProfileNotesCard
            student={page.student}
            notesClassFilter={page.notesClassFilter}
            setNotesClassFilter={page.setNotesClassFilter}
            notesClassOptions={page.notesClassOptions}
            filteredNotes={page.filteredNotes}
            notesLoading={page.notesLoading}
            notesError={page.notesError}
          />
        </div>
      </div>
    </div>
  );
}
