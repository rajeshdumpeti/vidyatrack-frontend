import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingButton } from "@/components/ui/Button";
import type {
  StudentImportCommitResponse,
  StudentImportPreviewResponse,
} from "@/types/student.types";

import { ManagementStudentsImportPreviewTable } from "./ManagementStudentsImportPreviewTable";
import { ManagementStudentsImportResult } from "./ManagementStudentsImportResult";
import { ManagementStudentsImportSummary } from "./ManagementStudentsImportSummary";

type PreviewGroup = {
  label: string;
  count: number;
};

type ManagementStudentsImportModalProps = {
  open: boolean;
  onClose: () => void;
  selectedAcademicContext: {
    className: string;
    sectionName: string;
  };
  previewAcademicGroups: PreviewGroup[];
  importFile: File | null;
  setImportFile: (file: File | null) => void;
  setPreviewData: (data: StudentImportPreviewResponse | null) => void;
  setCommitResult: (data: StudentImportCommitResponse | null) => void;
  previewData: StudentImportPreviewResponse | null;
  commitResult: StudentImportCommitResponse | null;
  previewImportPending: boolean;
  previewImportError: boolean;
  commitImportPending: boolean;
  downloadTemplate: () => void;
  handlePreviewImport: () => Promise<void>;
  handleCommitImport: () => Promise<void>;
  mapImportError: (code: string) => string;
};

export function ManagementStudentsImportModal({
  open,
  onClose,
  selectedAcademicContext,
  previewAcademicGroups,
  importFile,
  setImportFile,
  setPreviewData,
  setCommitResult,
  previewData,
  commitResult,
  previewImportPending,
  previewImportError,
  commitImportPending,
  downloadTemplate,
  handlePreviewImport,
  handleCommitImport,
  mapImportError,
}: ManagementStudentsImportModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-lg md:inset-10 md:mx-auto md:max-w-5xl md:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Import Students (Bulk)
          </h2>
          <button
            type="button"
            className="h-10 rounded-xl px-3 text-sm font-semibold text-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Academic Context
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border border-blue-200 bg-white px-3 py-1 font-semibold text-blue-900">
              Class: {selectedAcademicContext.className}
            </span>
            <span className="rounded-full border border-blue-200 bg-white px-3 py-1 font-semibold text-blue-900">
              Section: {selectedAcademicContext.sectionName}
            </span>
          </div>
          <p className="mt-2 text-xs text-blue-700">
            CSV rows should include `class_name` and `section_name` to map
            students correctly. Examples: `Grade 9`, `9th`, `Class 9`. Student
            ID is auto-generated; do not include it in the CSV.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={downloadTemplate}
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800"
          >
            Download CSV Template
          </button>
          <input
            type="file"
            accept=".csv"
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            disabled={previewImportPending || commitImportPending}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setImportFile(file);
              setPreviewData(null);
              setCommitResult(null);
            }}
          />
          <LoadingButton
            type="button"
            onClick={() => void handlePreviewImport()}
            disabled={!importFile || commitImportPending}
            isLoading={previewImportPending}
            loadingText="Validating..."
            fullWidth
            className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            Preview Import
          </LoadingButton>
        </div>

        {previewImportError ? (
          <div className="mt-4">
            <ErrorState
              title="Unable to preview import"
              message="Please check CSV format and class/section names."
            />
          </div>
        ) : null}

        {previewData ? (
          <div className="mt-4 space-y-4">
            <ManagementStudentsImportSummary
              previewData={previewData}
              previewAcademicGroups={previewAcademicGroups}
            />
            <ManagementStudentsImportPreviewTable
              previewData={previewData}
              mapImportError={mapImportError}
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <LoadingButton
                type="button"
                disabled={
                  !previewData.import_token ||
                  previewData.valid_rows === 0 ||
                  previewImportPending
                }
                onClick={() => void handleCommitImport()}
                isLoading={commitImportPending}
                loadingText="Importing..."
                className="h-11 rounded-xl bg-blue-600 px-5 text-sm hover:bg-blue-700"
              >
                Confirm Import
              </LoadingButton>
            </div>
          </div>
        ) : null}

        {commitResult ? (
          <ManagementStudentsImportResult commitResult={commitResult} />
        ) : null}
      </div>
    </div>
  );
}
