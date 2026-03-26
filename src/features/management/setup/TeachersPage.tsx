import { LoadingState } from "@/components/feedback/LoadingState";

import { TeachersSetupCreateForm } from "./teachers/components/TeachersSetupCreateForm";
import { TeachersSetupHeader } from "./teachers/components/TeachersSetupHeader";
import { useTeachersSetupPage } from "./teachers/hooks/useTeachersSetupPage";
import type { OtpRequestCountryCode } from "@/features/auth/otpRequest/types/otpRequest.types";

export function TeachersPage() {
  const page = useTeachersSetupPage();

  if (page.isLoading) return <LoadingState label="Loading teachers..." />;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-2">
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <TeachersSetupHeader />

          {page.successMsg ? (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
              {page.successMsg}
            </div>
          ) : null}

          <TeachersSetupCreateForm
            register={page.register}
            handleSubmit={page.handleSubmit}
            onSubmit={page.onSubmit}
            watchedClassId={page.watchedClassId}
            availableSections={page.availableSections}
            classes={page.classesQuery.list.data ?? []}
            isSubmitting={page.isSubmitting}
            isPending={page.createMutation.isPending}
            inlineError={page.inlineError}
            onClearForm={page.clearForm}
          />
        </div>
      </div>
    </div>
  );
}
