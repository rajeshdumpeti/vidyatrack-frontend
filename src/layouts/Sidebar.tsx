import { NavLink } from "react-router-dom";

type SidebarProps = {
  onClose?: () => void;
};

const linkBase = "flex h-11 items-center rounded-xl px-3 text-sm font-semibold";

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="text-sm font-extrabold tracking-tight text-gray-900">
          Navigation
        </div>

        {/* Close button visible only in drawer mode */}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            aria-label="Close menu"
          >
            Close
          </button>
        ) : null}
      </div>

      {/* Placeholder links (no role filtering yet) */}
      <nav className="flex flex-1 flex-col gap-2 p-3">
        <NavLink
          to="/teacher"
          className={({ isActive }) =>
            [
              linkBase,
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-800 hover:bg-gray-50",
            ].join(" ")
          }
        >
          Teacher
        </NavLink>

        <NavLink
          to="/teacher/attendance"
          className={({ isActive }) =>
            [
              linkBase,
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-800 hover:bg-gray-50",
            ].join(" ")
          }
        >
          Attendance
        </NavLink>

        <NavLink
          to="/teacher/marks"
          className={({ isActive }) =>
            [
              linkBase,
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-800 hover:bg-gray-50",
            ].join(" ")
          }
        >
          Marks
        </NavLink>

        <div className="my-2 h-px bg-gray-200" />

        <NavLink
          to="/principal"
          className={({ isActive }) =>
            [
              linkBase,
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-800 hover:bg-gray-50",
            ].join(" ")
          }
        >
          Principal
        </NavLink>

        <NavLink
          to="/management"
          className={({ isActive }) =>
            [
              linkBase,
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-800 hover:bg-gray-50",
            ].join(" ")
          }
        >
          Management
        </NavLink>
      </nav>

      <div className="border-t border-gray-200 p-3 text-xs text-gray-500">
        Placeholder menu (role filtering comes later)
      </div>
    </aside>
  );
}
