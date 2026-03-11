export function ManagementStudentsImportOverlay({
  open,
}: {
  open: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35">
      <div className="rounded-2xl border border-blue-100 bg-white px-8 py-6 text-center shadow-xl">
        <div className="text-base font-bold text-gray-900">
          Importing students...
        </div>
        <div className="mt-1 text-sm text-gray-600">
          Please wait while we process the file.
        </div>
      </div>
    </div>
  );
}
