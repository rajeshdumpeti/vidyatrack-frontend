export function ErrorState({
  title = "Something went wrong",
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <div className="text-sm font-semibold text-red-800">{title}</div>
      {message ? (
        <div className="mt-1 text-sm text-red-700">{message}</div>
      ) : null}
    </div>
  );
}
