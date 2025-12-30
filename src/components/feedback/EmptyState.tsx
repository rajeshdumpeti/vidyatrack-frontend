export function EmptyState({
  message = "No data found.",
}: {
  message?: string;
}) {
  return <div>{message}</div>;
}
