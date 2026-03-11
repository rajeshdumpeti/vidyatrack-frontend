import type { AttendanceCounts } from "../types/markAttendance.types";

type MarkAttendanceSummaryProps = {
  counts: AttendanceCounts;
  isSubmitting: boolean;
  isReadOnly: boolean;
  onSubmit: () => void;
};

export function MarkAttendanceSummary({
  counts,
  isSubmitting,
  isReadOnly,
  onSubmit,
}: MarkAttendanceSummaryProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-gray-50/80 p-4 backdrop-blur-md md:relative md:z-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
      <div className="mx-auto max-w-md rounded-[32px] border border-white bg-[#F4F7FF] p-6 text-center shadow-2xl md:max-w-none md:rounded-3xl md:border-blue-100 md:bg-[#EEF2FF] md:p-8 md:shadow-xl">
        <div className="mb-6 flex items-center justify-center gap-8 md:gap-12">
          <div className="text-center">
            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
              Present
            </div>
            <div className="text-3xl font-black text-[#12B76A] md:text-4xl">
              {String(counts.present).padStart(2, "0")}
            </div>
          </div>
          <div className="h-10 w-[1px] bg-blue-100 md:bg-blue-200" />
          <div className="text-center">
            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
              Absent
            </div>
            <div className="text-3xl font-black text-[#F04438] md:text-4xl">
              {String(counts.absent).padStart(2, "0")}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || isReadOnly}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2D54E8] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#2546C1] active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? "Syncing..." : "Submit Attendance"}{" "}
          <span className="text-lg">➤</span>
        </button>
        <p className="mt-4 text-[9px] font-bold uppercase tracking-widest text-gray-400 md:text-[10px] md:font-medium">
          Data will be instantly synced with the central management portal.
        </p>
      </div>
    </div>
  );
}
