import { ArrowLeft } from "lucide-react";

import { PlatformCreateSchoolAlerts } from "./createSchool/components/PlatformCreateSchoolAlerts";
import { PlatformCreateSchoolFooter } from "./createSchool/components/PlatformCreateSchoolFooter";
import { PlatformCreateSchoolStepContent } from "./createSchool/components/PlatformCreateSchoolStepContent";
import { PlatformCreateSchoolStepHeader } from "./createSchool/components/PlatformCreateSchoolSteps";
import { usePlatformCreateSchool } from "./createSchool/hooks/usePlatformCreateSchool";

export function PlatformCreateSchoolPage() {
  const page = usePlatformCreateSchool();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <button
        type="button"
        onClick={page.navigateBack}
        className="mb-6 flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Schools</span>
      </button>

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
