import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";

import { AttendanceHistoryBreakdownTable } from "./history/components/AttendanceHistoryBreakdownTable";
import { AttendanceHistoryFilters } from "./history/components/AttendanceHistoryFilters";
import { AttendanceHistoryHeader } from "./history/components/AttendanceHistoryHeader";
import { AttendanceHistorySummaryCards } from "./history/components/AttendanceHistorySummaryCards";
import { useAttendanceHistoryPage } from "./history/hooks/useAttendanceHistoryPage";
import { InsightState } from "@/components/feedback/InsightState";

export function AttendanceHistoryPage() {
  const page = useAttendanceHistoryPage();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <AttendanceHistoryHeader />

      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5">
        <AttendanceHistoryFilters
          sectionId={page.sectionId}
          dateIso={page.dateIso}
          todayIso={page.todayIso}
          sections={page.sections.data ?? []}
          sectionsLoading={page.sections.isLoading}
          sectionLabelById={page.sectionLabelById}
          onFilterChange={page.onFilterChange}
        />

        {page.query.isLoading ? (
          <LoadingState label="Loading attendance..." />
        ) : null}

        {page.query.error ? (
          <ErrorState
            title="Unable to load attendance"
            message="Please try again."
          />
        ) : null}

        {!page.query.isLoading &&
        !page.query.error &&
        page.rows.length === 0 ? (
          <div className="mt-8">
            <InsightState
              title="No records for the selected date/section."
              description="Try a different selecting section and date to view performance insights. "
            />
          </div>
        ) : null}

        {!page.query.isLoading && !page.query.error && page.rows.length > 0 ? (
          <div className="space-y-5">
            <AttendanceHistorySummaryCards totals={page.totals} />
            <AttendanceHistoryBreakdownTable rows={page.breakdown} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
