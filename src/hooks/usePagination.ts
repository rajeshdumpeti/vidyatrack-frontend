import { useEffect, useMemo, useState } from "react";

type UsePaginationOptions = {
  initialPage?: number;
  initialPageSize?: number;
  resetDeps?: ReadonlyArray<unknown>;
};

export function usePagination<T>(
  items: T[],
  options?: UsePaginationOptions,
) {
  const initialPage = options?.initialPage ?? 1;
  const initialPageSize = options?.initialPageSize ?? 10;
  const resetDeps = options?.resetDeps ?? [];

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  const from = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    from,
    to,
    pagedItems,
    setPage,
    setPageSize,
  };
}

