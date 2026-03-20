import { Search } from "lucide-react";

type PlatformSchoolsListSearchProps = {
  search: string;
  setSearch: (value: string) => void;
};

export function PlatformSchoolsListSearch({
  search,
  setSearch,
}: PlatformSchoolsListSearchProps) {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search by school name..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 outline-none transition-all focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
