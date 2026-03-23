import { RefreshCcw } from "lucide-react";

import { PlatformSchoolsListGrid } from "./schoolsList/components/PlatformSchoolsListGrid";
import { PlatformSchoolsListHeader } from "./schoolsList/components/PlatformSchoolsListHeader";
import { PlatformSchoolsListSearch } from "./schoolsList/components/PlatformSchoolsListSearch";
import { usePlatformSchoolsListPage } from "./schoolsList/hooks/usePlatformSchoolsListPage";

export function PlatformSchoolsListPage() {
  const page = usePlatformSchoolsListPage();

  if (page.list.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCcw className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-gray-500 font-medium">Fetching pilot schools...</p>
      </div>
    );
  }

  if (page.list.isError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl mx-6 mt-6 border border-red-100">
        <p className="text-red-600 font-semibold">Could not load school list</p>
        <button
          onClick={() => page.list.refetch()}
          className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isEmpty = !page.list.isFetching && page.filteredSchools.length === 0 && page.debouncedSearch;
  const totalPages = page.paginationMeta?.total_pages ?? 1;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <PlatformSchoolsListHeader schoolCount={page.paginationMeta?.total ?? page.filteredSchools.length} />
      <PlatformSchoolsListSearch
        search={page.search}
        setSearch={(v) => { page.setSearch(v); page.setPage(1); }}
      />
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-center">
          <p className="text-gray-500 font-medium">
            No schools found for &quot;{page.debouncedSearch}&quot;
          </p>
          <button
            type="button"
            onClick={() => page.setSearch("")}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            Clear search
          </button>
        </div>
      ) : (
        <PlatformSchoolsListGrid
          schools={page.filteredSchools}
          fallbackBySchoolId={page.fallbackBySchoolId}
        />
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Page {page.page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => page.setPage((p) => Math.max(1, p - 1))}
              disabled={page.page <= 1}
              className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => page.setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page.page >= totalPages}
              className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
