/**
 * Run async tasks with a fixed concurrency limit.
 * Preserves order of results.
 */
export async function mapWithConcurrency<TIn, TOut>(
  items: TIn[],
  concurrency: number,
  worker: (item: TIn, index: number) => Promise<TOut>
): Promise<TOut[]> {
  const limit = Math.max(1, Math.floor(concurrency));
  const results: TOut[] = new Array(items.length);

  let nextIndex = 0;

  async function runOne(): Promise<void> {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;

      if (current >= items.length) return;

      results[current] = await worker(items[current], current);
    }
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, () =>
    runOne()
  );
  await Promise.all(runners);

  return results;
}
