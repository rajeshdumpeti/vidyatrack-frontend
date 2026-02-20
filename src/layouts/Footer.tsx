export function Footer() {
  return (
    <footer className="border-t border-gray-200/80 bg-white/75">
      <div className="mx-auto flex h-12 w-full items-center justify-between px-4 text-xs font-medium text-gray-500 md:px-6">
        <span>© {new Date().getFullYear()} VidyaTrack</span>
        <span>Pilot</span>
      </div>
    </footer>
  );
}
