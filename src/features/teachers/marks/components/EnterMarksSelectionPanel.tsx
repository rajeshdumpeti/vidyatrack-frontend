import { BookOpen, Ruler } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { EXAM_TYPE_PRESETS } from "@/constants/examTypes";
import { prettyExamType } from "@/utils/exams";
import type { FormValues } from "../types/enterMarks.types";

type EnterMarksSelectionPanelProps = {
  assignmentClassLabel: string;
  assignmentSectionLabel: string;
  assignmentSubjectLabel: string;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  maxMarks: number;
  lockMaxMarks: boolean;
  isContextLoading: boolean;
  activeExamType: string;
  customExamChips: string[];
  showCustomExamInput: boolean;
  customExamDraft: string;
  setCustomExamDraft: (value: string) => void;
  setShowCustomExamInput: (value: boolean | ((value: boolean) => boolean)) => void;
  applyExamContext: (examType: string) => void;
  addCustomExamChip: () => void;
};

export function EnterMarksSelectionPanel({
  assignmentClassLabel,
  assignmentSectionLabel,
  assignmentSubjectLabel,
  register,
  errors,
  maxMarks,
  lockMaxMarks,
  isContextLoading,
  activeExamType,
  customExamChips,
  showCustomExamInput,
  customExamDraft,
  setCustomExamDraft,
  setShowCustomExamInput,
  applyExamContext,
  addCustomExamChip,
}: EnterMarksSelectionPanelProps) {
  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:mt-6 md:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-900 md:text-base">
            Class & Subject
          </label>
          <div className="mt-2 flex items-center gap-2 text-base font-semibold text-gray-900 md:text-lg">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>
              {assignmentClassLabel}
              {assignmentSectionLabel ? ` - ${assignmentSectionLabel}` : ""}
              {assignmentSubjectLabel ? ` • ${assignmentSubjectLabel}` : ""}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 md:text-base">
            Maximum Marks
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3">
            <Ruler className="h-5 w-5 text-blue-600" />
            <input
              type="number"
              min={1}
              max={1000}
              inputMode="numeric"
              className="w-full bg-transparent text-base font-semibold text-gray-900 outline-none md:text-sm"
              disabled={lockMaxMarks || isContextLoading}
              {...register("maxMarks", {
                required: "Maximum marks is required",
                validate: (value) =>
                  Number(value) > 0 || "Maximum marks must be greater than 0",
              })}
            />
          </div>
          <p
            className={`mt-1 text-xs leading-relaxed ${lockMaxMarks ? "text-red-500" : "text-gray-500"}`}
          >
            This exam is scored out of {maxMarks}.
            {lockMaxMarks
              ? " Maximum marks is locked because marks already exist for this exam."
              : ""}
          </p>
          {errors.maxMarks ? (
            <p className="mt-1 text-xs text-red-600">{errors.maxMarks.message}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <label className="block text-sm font-semibold text-gray-900 md:text-base">
          Assessment Type
        </label>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {EXAM_TYPE_PRESETS.map((preset) => {
            const active = activeExamType === preset.value;

            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => applyExamContext(preset.value)}
                className={[
                  "rounded-full border px-3.5 py-2 text-sm font-semibold transition",
                  active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:text-blue-700",
                ].join(" ")}
              >
                {preset.label}
              </button>
            );
          })}

          {customExamChips.map((chip) => {
            const active = activeExamType === chip;

            return (
              <button
                key={chip}
                type="button"
                onClick={() => applyExamContext(chip)}
                className={[
                  "rounded-full border px-3.5 py-2 text-sm font-semibold transition",
                  active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:text-blue-700",
                ].join(" ")}
              >
                {prettyExamType(chip)}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowCustomExamInput((value) => !value)}
            className={[
              "rounded-full border px-3.5 py-2 text-sm font-semibold transition",
              showCustomExamInput
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:text-blue-700",
            ].join(" ")}
          >
            + Add Exam
          </button>
        </div>

        {showCustomExamInput ? (
          <div className="mt-3">
            <input
              type="text"
              placeholder="e.g. PRE_BOARD_1 or Formative Assessment 1"
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={customExamDraft}
              onChange={(event) => setCustomExamDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustomExamChip();
                }
              }}
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={addCustomExamChip}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add Exam
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomExamInput(false);
                  setCustomExamDraft("");
                }}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
