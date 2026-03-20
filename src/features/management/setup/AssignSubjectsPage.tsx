import { Link2 } from "lucide-react";

import { LoadingState } from "@/components/feedback/LoadingState";

import { AcademicSetupShell } from "./AcademicSetupShell";
import { AssignSubjectsContextCard } from "./assignSubjects/components/AssignSubjectsContextCard";
import { AssignSubjectsGrid } from "./assignSubjects/components/AssignSubjectsGrid";
import { useAssignSubjectsPage } from "./assignSubjects/hooks/useAssignSubjectsPage";

export function AssignSubjectsPage() {
  const page = useAssignSubjectsPage();

  if (page.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <LoadingState label="Loading assignment controls..." />
      </div>
    );
  }

  return (
    <AcademicSetupShell
      title="Assignment Management"
      description="Map each subject to a responsible teacher with section-level control."
      icon={Link2}
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <AssignSubjectsContextCard
          classId={page.classId}
          sectionId={page.sectionId}
          classes={page.classes}
          sections={page.sections}
          sectionsLoading={page.sectionsQuery.isLoading}
          noSectionsForClass={page.noSectionsForClass}
          selectedClass={page.selectedClass}
          onClassChange={page.onClassChange}
          onSectionChange={page.onSectionChange}
          onCreateDefaultSection={() => page.createDefaultSectionMutation.mutate()}
          isCreatingDefaultSection={page.createDefaultSectionMutation.isPending}
        />

        <AssignSubjectsGrid
          sectionId={page.sectionId}
          sections={page.sections}
          subjects={page.subjects}
          teachers={page.teachers}
          selectedTeacherBySubject={page.selectedTeacherBySubject}
          assignedTeacherIdBySubject={page.assignedTeacherIdBySubject}
          rowMessage={page.rowMessage}
          recentlyCompletedSubjectId={page.recentlyCompletedSubjectId}
          bulkSaving={page.bulkSaving}
          bulkMessage={page.bulkMessage}
          pendingAssignmentsCount={page.pendingAssignmentsCount}
          createMutationPending={page.createMutation.isPending}
          createMutationSubjectId={page.createMutation.variables?.subject_id}
          teacherName={page.teacherName}
          onTeacherChange={page.onTeacherChange}
          onAssign={page.assignForSubject}
          onSaveAll={page.onSaveAll}
        />
      </section>
    </AcademicSetupShell>
  );
}
