import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { InsightState } from "@/components/feedback/InsightState";

import { MarksHistoryClassBreakdownTable } from "./history/components/MarksHistoryClassBreakdownTable";
import { MarksHistoryFilters } from "./history/components/MarksHistoryFilters";
import { MarksHistoryHeader } from "./history/components/MarksHistoryHeader";
import { MarksHistoryStudentResultsTable } from "./history/components/MarksHistoryStudentResultsTable";
import { MarksHistorySummaryCards } from "./history/components/MarksHistorySummaryCards";
import { useMarksHistoryPage } from "./history/hooks/useMarksHistoryPage";

export function MarksHistoryPage() {
  const page = useMarksHistoryPage();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <MarksHistoryHeader />

      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5">
        <MarksHistoryFilters
          sectionId={page.sectionId}
          subjectId={page.subjectId}
          selectedSubjectId={page.selectedSubjectId}
          examType={page.examType}
          sections={page.sections.data ?? []}
          subjects={page.subjects.data}
          sectionsLoading={page.sections.isLoading}
          subjectsLoading={page.subjects.isLoading}
          sectionLabelById={page.sectionLabelById}
          onFilterChange={page.onFilterChange}
          onExport={page.exportCsv}
        />

        {page.loading ? <LoadingState label="Loading marks..." /> : null}
        {!page.loading && page.query.error ? (
          <ErrorState
            title="Unable to load marks"
            message="Please try again."
          />
        ) : null}
        {!page.loading && !page.query.error && page.rows.length === 0 ? (
          <InsightState
            title="No marks found for selected filters"
            description="Try a different section, subject, or exam type to view performance insights. Once marks are available, this page will auto-populate detailed class and student metrics."
          />
        ) : null}

        {page.hasData ? (
          <div className="space-y-5">
            <MarksHistorySummaryCards totals={page.totals} />
            <MarksHistoryClassBreakdownTable rows={page.classBreakdown} />
            <MarksHistoryStudentResultsTable
              search={page.search}
              setSearch={page.setSearch}
              pagination={page.rosterPagination}
              sectionLabelById={page.sectionLabelById}
              onOpenStudent={page.openStudent}
              onExport={page.exportCsv}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
