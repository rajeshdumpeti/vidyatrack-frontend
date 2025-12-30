export function ErrorState({
  title = "Something went wrong",
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div>
      <div>{title}</div>
      {message ? <div>{message}</div> : null}
    </div>
  );
}
