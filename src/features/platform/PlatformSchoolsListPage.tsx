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

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <PlatformSchoolsListHeader schoolCount={page.filteredSchools.length} />
      <PlatformSchoolsListSearch
        search={page.search}
        setSearch={page.setSearch}
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
    </div>
  );
}
