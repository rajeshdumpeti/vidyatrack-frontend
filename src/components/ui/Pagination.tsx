type PaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

function buildVisiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (page <= 3) return [1, 2, 3, 4, totalPages];
  if (page >= totalPages - 2) {
    return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, page - 1, page, page + 1, totalPages];
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  from,
  to,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = "",
}: PaginationProps) {
  const pages = buildVisiblePages(page, totalPages);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div
      className={`flex flex-col gap-3 border-t border-gray-200 px-4 py-3 md:flex-row md:items-center md:justify-between ${className}`}
    >
      <div className="text-xs font-medium text-gray-500">
        Showing {from}-{to} of {totalItems}
      </div>

      <div className="flex items-center gap-2">
        {onPageSizeChange ? (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 outline-none"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}/page
              </option>
            ))}
          </select>
        ) : null}

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 disabled:opacity-50"
        >
          Prev
        </button>

        {pages.map((p, idx) => {
          const showEllipsis =
            idx > 0 && p - pages[idx - 1] > 1;
          return (
            <span key={p} className="flex items-center gap-2">
              {showEllipsis ? (
                <span className="text-xs text-gray-400">...</span>
              ) : null}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={[
                  "h-8 min-w-8 rounded-lg border px-2 text-xs font-semibold",
                  p === page
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-700",
                ].join(" ")}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

