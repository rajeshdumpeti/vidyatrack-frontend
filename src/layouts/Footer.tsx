export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-4 text-xs text-gray-500">
        <span>© {new Date().getFullYear()} VidyaTrack</span>
        <span>Pilot</span>
      </div>
    </footer>
  );
}
