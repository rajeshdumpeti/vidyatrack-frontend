type PlatformCreateSchoolAlertsProps = {
  stepErrors: string[];
  showCreateError: boolean;
};

export function PlatformCreateSchoolAlerts({
  stepErrors,
  showCreateError,
}: PlatformCreateSchoolAlertsProps) {
  return (
    <>
      {stepErrors.length > 0 ? (
        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="mb-2 text-sm font-semibold text-red-700">
            Please fix the following:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-red-600">
            {stepErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {showCreateError && stepErrors.length === 0 ? (
        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-600">
            Failed to create school. Admin phone might already be registered.
          </p>
        </div>
      ) : null}
    </>
  );
}
