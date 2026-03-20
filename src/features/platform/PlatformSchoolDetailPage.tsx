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
        <PlatformSchoolPeopleTable
          activeTab={page.activeTab}
          setActiveTab={page.setActiveTab}
          search={page.search}
          setSearch={page.setSearch}
          rows={page.filteredRows}
        />
      )}
    </div>
  );
}
