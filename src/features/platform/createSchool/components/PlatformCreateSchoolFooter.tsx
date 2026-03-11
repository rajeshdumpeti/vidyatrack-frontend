import { ShieldCheck } from "lucide-react";

import { LoadingButton } from "@/components/ui/Button";

type PlatformCreateSchoolFooterProps = {
  step: number;
  totalSteps: number;
  onResetDraft: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export function PlatformCreateSchoolFooter({
  step,
  totalSteps,
  onResetDraft,
  onBack,
  onNext,
  onSubmit,
  isSubmitting,
}: PlatformCreateSchoolFooterProps) {
  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onResetDraft}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        Reset Draft
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={step === 0}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        {step < totalSteps - 1 ? (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Continue
          </button>
        ) : (
          <LoadingButton
            type="button"
            onClick={onSubmit}
            isLoading={isSubmitting}
            loadingText="Creating School..."
            leftIcon={<ShieldCheck className="h-4 w-4" />}
            className="py-2.5 text-sm font-bold"
          >
            Confirm & Onboard School
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
