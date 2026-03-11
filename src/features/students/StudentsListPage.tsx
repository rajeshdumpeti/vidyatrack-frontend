import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";

import { StudentsListFilters } from "./list/components/StudentsListFilters";
import { StudentsListHeader } from "./list/components/StudentsListHeader";
import { StudentsPrincipalTable } from "./list/components/StudentsPrincipalTable";
import { StudentsTeacherList } from "./list/components/StudentsTeacherList";
import { useStudentsListPage } from "./list/hooks/useStudentsListPage";

export function StudentsListPage() {
  const page = useStudentsListPage();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <StudentsListHeader isTeacher={page.isTeacher} />

      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5">
        <StudentsListFilters
          isTeacher={page.isTeacher}
          search={page.search}
          sectionId={page.sectionId}
          sections={page.sectionsList.data ?? []}
          sectionsLoading={page.sectionsList.isLoading}
          sectionLabelById={page.sectionLabelById}
          onFilterChange={page.onFilterChange}
        />

        {page.isTeacher ? (
          page.teacherSection.isLoading || page.teacherStudents.isLoading ? (
            <LoadingState label="Loading students..." />
          ) : null
        ) : page.principalQuery.isLoading ? (
          <LoadingState label="Loading students..." />
        ) : null}

        {page.isTeacher ? (
          page.teacherSection.error || page.teacherStudents.error ? (
            <ErrorState
              title="Unable to load students"
              message="Please try again."
            />
          ) : null
        ) : page.principalQuery.error ? (
          <ErrorState
            title="Unable to load students"
            message="Please try again."
          />
        ) : null}

        {page.isTeacher && !page.teacherSection.isLoading && !page.teacherSectionId ? (
          <EmptyState message="No attendance section assigned yet." />
        ) : null}

        {page.isTeacher &&
        page.teacherFiltered.length === 0 &&
        page.teacherSectionId ? (
          <EmptyState message="No students found for your section." />
        ) : null}

        {!page.isTeacher && page.principalStudents.length === 0 ? (
          <EmptyState message="No students match the selected filters." />
        ) : null}

        {!page.isTeacher && page.principalStudents.length > 0 ? (
          <StudentsPrincipalTable
            students={page.principalStudents}
            pagination={page.principalPagination}
            sectionLabelById={page.sectionLabelById}
            onOpenStudent={page.openStudent}
            onViewStudent={page.viewStudent}
          />
        ) : null}

        {page.isTeacher && page.teacherFiltered.length > 0 ? (
          <StudentsTeacherList
            students={page.teacherFiltered}
            pagination={page.teacherPagination}
            className={page.teacherSection.data?.class_name}
            sectionName={page.teacherSection.data?.section_name}
            onOpenStudent={page.openStudent}
          />
        ) : null}
      </main>
    </div>
  );
}
