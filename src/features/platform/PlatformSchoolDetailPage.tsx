import { PlatformSchoolDetailHeader } from "./schoolDetail/components/PlatformSchoolDetailHeader";
import { PlatformSchoolMetricsGrid } from "./schoolDetail/components/PlatformSchoolMetricsGrid";
import { PlatformSchoolOverviewTab } from "./schoolDetail/components/PlatformSchoolOverviewTab";
import { PlatformSchoolPeopleTable } from "./schoolDetail/components/PlatformSchoolPeopleTable";
import { usePlatformSchoolDetailPage } from "./schoolDetail/hooks/usePlatformSchoolDetailPage";

export function PlatformSchoolDetailPage() {
  const page = usePlatformSchoolDetailPage();

  if (!page.safeSchoolId) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p className="font-semibold text-red-600">Invalid school id.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <PlatformSchoolDetailHeader
        schoolName={page.school?.name ?? `School #${page.safeSchoolId}`}
        onRefresh={page.refresh}
        isRefreshing={page.isRefreshing}
      />

      <PlatformSchoolMetricsGrid metrics={page.metrics} />

      {page.activeTab === "overview" ? (
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <PlatformSchoolPeopleTable
            activeTab={page.activeTab}
            setActiveTab={page.setActiveTab}
            search={page.search}
            setSearch={page.setSearch}
            rows={[]}
          />
          <div className="-mt-6">
            <PlatformSchoolOverviewTab metrics={page.metrics} />
          </div>
        </section>
      ) : (
        <>
          <PlatformSchoolPeopleTable
            activeTab={page.activeTab}
            setActiveTab={(tab) => {
              page.setActiveTab(tab);
              page.setTabPage(1);
            }}
            search={page.search}
            setSearch={page.setSearch}
            rows={page.filteredRows}
          />
          {page.filteredRows.length > 0 && (
            <div className="flex items-center justify-between gap-4 px-1 mt-3">
              <p className="text-sm text-gray-500">
                Page {page.tabPage} of {page.tabTotalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => page.setTabPage((p) => Math.max(1, p - 1))}
                  disabled={page.tabPage <= 1}
                  className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    page.setTabPage((p) => Math.min(page.tabTotalPages, p + 1))
                  }
                  disabled={page.tabPage >= page.tabTotalPages}
                  className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
