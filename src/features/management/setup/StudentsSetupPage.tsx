import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StudentsSetupFilters } from "./studentsSetup/components/StudentsSetupFilters";
import { StudentsSetupHeader } from "./studentsSetup/components/StudentsSetupHeader";
import { StudentsSetupResults } from "./studentsSetup/components/StudentsSetupResults";
import { useStudentsSetupPage } from "./studentsSetup/hooks/useStudentsSetupPage";

export function StudentsSetupPage() {
  const page = useStudentsSetupPage();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <StudentsSetupHeader />

      <StudentsSetupFilters
        sectionId={page.sectionId}
        search={page.search}
        sections={page.sections}
        onFilterChange={page.onFilterChange}
      />

      {page.studentsQuery.isLoading ? <LoadingState label="Loading students..." /> : null}

      {page.studentsQuery.error ? (
        <ErrorState
          title="Unable to load students"
          message="Please try again."
        />
      ) : null}

      {page.filteredMock.length === 0 ? (
        <EmptyState message="No students match the selected filters." />
      ) : null}

      <StudentsSetupResults
        students={page.filteredMock}
        sections={page.sections}
        onStudentClick={(student) =>
          page.onStudentClick(student.id, student.public_id)
        }
      />
    </div>
  );
}
