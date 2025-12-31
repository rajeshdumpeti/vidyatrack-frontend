// src/features/teacher/dashboard/TeacherDashboard.tsx
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { IoTimeOutline } from "react-icons/io5";

export function TeacherDashboard() {
  const navigate = useNavigate();

  // UI-only mocks (will be replaced by backend later)
  const sectionLabel = "Class 5 - Section B";
  const subjectLabel = "Mathematics";
  const timeLabel = "09:00 AM — 10:00 AM";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Active Session
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
            Current Session
          </h1>
          <p className="mt-2 text-base font-medium text-gray-600">
            Your next action is waiting below.
          </p>
        </div>

        {/* Session card */}
        <div className="mt-10 overflow-hidden rounded-2xl shadow-lg">
          <div className="relative bg-gradient-to-br from-slate-700 via-slate-700 to-slate-900 px-6 py-8">
            <div className="absolute inset-0 opacity-20" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-slate-200">
                <div className="inline-flex items-center gap-2">
                  <IoTimeOutline className="h-5 w-5" />
                  {timeLabel}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-4xl font-extrabold tracking-tight text-white">
                    {subjectLabel} <span className="text-white/70">|</span>{" "}
                    {sectionLabel}
                  </div>

                  <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200">
                    <HiOutlineAcademicCap className="h-5 w-5 text-slate-200" />
                    Your Attendance Section is already set for today.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/teacher/attendance")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                    <FiCheckCircle className="h-4 w-4" />
                  </span>
                  Mark Attendance
                </button>
              </div>
            </div>
          </div>

          {/* Thin accent line (matches screenshot feel) */}
          <div className="h-1 w-full bg-blue-600" />
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          Powered by{" "}
          <span className="font-semibold text-gray-900">VidyaTrack</span>
        </div>
      </main>
    </div>
  );
}
