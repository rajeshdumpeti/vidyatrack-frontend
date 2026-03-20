import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";

import { TeacherProfileAssignmentsCard } from "./profile/components/TeacherProfileAssignmentsCard";
import { TeacherProfileHeaderCard } from "./profile/components/TeacherProfileHeaderCard";
import { useTeacherProfilePage } from "./profile/hooks/useTeacherProfilePage";

export function TeacherProfilePage() {
  const page = useTeacherProfilePage();

  if (!Number.isFinite(page.teacherId) || page.teacherId <= 0) {
    return (
      <div className="px-4 py-6">
        <ErrorState title="Teacher not found" message="Invalid teacher ID." />
      </div>
    );
  }

  if (page.isLoading) {
    return (
      <div className="px-4 py-6">
        <LoadingState label="Loading teacher..." />
      </div>
    );
  }

  if (page.error || !page.teacher || !page.viewModel) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          title="Teacher not found"
          message="Unable to load teacher profile."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-5">
        <TeacherProfileHeaderCard {...page.viewModel} />
        <TeacherProfileAssignmentsCard
          primarySection={page.viewModel.primarySection}
          assignmentLabels={page.viewModel.assignmentLabels}
        />
      </div>
    </div>
  );
}
