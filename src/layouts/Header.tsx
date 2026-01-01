type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 md:hidden"
            aria-label="Open menu"
          >
            Menu
          </button>

          <div className="text-base font-extrabold tracking-tight text-gray-900">
            VidyaTrack
          </div>
        </div>

        <div className="text-sm font-medium text-gray-600">School Portal</div>
      </div>
    </header>
  );
}
