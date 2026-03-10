import { BookText } from "lucide-react";

import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";

import { AcademicSetupShell } from "./AcademicSetupShell";
import { SubjectsCreateForm } from "./subjects/components/SubjectsCreateForm";
import { SubjectsDirectory } from "./subjects/components/SubjectsDirectory";
import { SubjectsSummaryCards } from "./subjects/components/SubjectsSummaryCards";
import { useSubjectsPage } from "./subjects/hooks/useSubjectsPage";

export function SubjectsPage() {
  const page = useSubjectsPage();

  if (page.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <LoadingState label="Loading subject catalog..." />
      </div>
    );
  }

  if (page.error) {
    return (
      <div className="mx-auto mt-16 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ErrorState
          title="Unable to load subjects"
          message="Please retry to restore catalog data."
        />
        <button
          type="button"
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          onClick={() => page.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AcademicSetupShell
      title="Subject Catalog"
      description="Maintain the canonical subject list before assigning teaching load."
      icon={BookText}
    >
      <SubjectsSummaryCards registeredCount={page.filtered.length} />
      <SubjectsCreateForm
        name={page.name}
        setName={page.setName}
        inlineError={page.inlineError}
        clearInlineError={page.clearInlineError}
        onSubmit={page.submit}
        isPending={page.createMutation.isPending}
      />
      <SubjectsDirectory
        subjects={page.filtered}
        search={page.search}
        setSearch={page.setSearch}
        subjectUsage={page.subjectUsage}
      />
    </AcademicSetupShell>
  );
}
