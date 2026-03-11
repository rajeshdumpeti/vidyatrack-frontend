import { HiAcademicCap } from "react-icons/hi2";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 mr-7 ${className ?? ""}`}>
      <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
        <HiAcademicCap className="h-8 w-8 text-blue-600" />
      </div>

      <div>
        {/* <div className="text-xl font-semibold text-gray-900">VidyaTrack</div> */}
        <div className="text-lg font-bold text-blue-600">
          Vidya
          <span className="bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] bg-clip-text text-transparent">
            Track
          </span>
        </div>

        <div className="text-xs text-gray-500 tracking-wide">
          School Operations Platform
        </div>
      </div>
    </div>
  );
}
