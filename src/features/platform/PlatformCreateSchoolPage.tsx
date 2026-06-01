import { ArrowLeft } from "lucide-react";

import { PlatformCreateSchoolAlerts } from "./createSchool/components/PlatformCreateSchoolAlerts";
import { PlatformCreateSchoolFooter } from "./createSchool/components/PlatformCreateSchoolFooter";
import { PlatformCreateSchoolStepContent } from "./createSchool/components/PlatformCreateSchoolStepContent";
import { PlatformCreateSchoolStepHeader } from "./createSchool/components/PlatformCreateSchoolSteps";
import { PlatformCreateSchoolSuccess } from "./createSchool/components/PlatformCreateSchoolSuccess";
import { usePlatformCreateSchool } from "./createSchool/hooks/usePlatformCreateSchool";

export function PlatformCreateSchoolPage() {
  const page = usePlatformCreateSchool();

  if (page.successData) {
    return (
      <PlatformCreateSchoolSuccess
        data={page.successData}
        onBackToSchools={page.navigateToSchools}
        onCreateAnother={page.resetDraft}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <button
        type="button"
        onClick={page.navigateToSchools}
        className="mb-6 flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Schools</span>
      </button>

      {page.showDraftBanner && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            You have an unsaved draft. Continue where you left off?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={page.dismissDraftBanner}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={page.resetDraft}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Register New School</h1>
          <p className="mt-1 text-gray-500">
            Phase 1 onboarding wizard for school and management setup.
          </p>
        </div>

        <PlatformCreateSchoolStepHeader
          step={page.step}
          steps={page.steps}
          progress={page.progress}
        />

        <PlatformCreateSchoolStepContent
          step={page.step}
          steps={page.steps}
          form={page.form}
          updateField={page.updateField}
          toggleArrayValue={page.toggleArrayValue}
        />

        <PlatformCreateSchoolAlerts
          stepErrors={page.stepErrors}
          showCreateError={page.create.isError}
        />

        <PlatformCreateSchoolFooter
          step={page.step}
          totalSteps={page.steps.length}
          onResetDraft={page.resetDraft}
          onBack={page.goBack}
          onNext={page.goNext}
          onSubmit={page.submit}
          isSubmitting={page.isSubmitting || page.create.isPending}
        />
      </div>
    </div>
  );
}
