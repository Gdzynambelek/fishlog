"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { CatchCard } from "@/components/cards/CatchCard";
import { CatchesTable } from "./CatchesTable";
import type { CatchWithTripName } from "@/lib/queries/catches";
import { fetchMoreCatches } from "@/lib/queries/catches.client";

/**
 * Renders the initial catches (server-fetched) and lazy-loads more pages
 * as the sentinel scrolls into view. Switches between table (md+) and
 * card grid (<md) layout via Tailwind responsive utilities.
 */
export function InfiniteCatches({
  initial,
  initialHasMore,
}: {
  initial: CatchWithTripName[];
  initialHasMore: boolean;
}) {
  const params = useSearchParams();
  const [items, setItems] = useState(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef(1);

  // Reset pagination when filter params change — the server-rendered
  // `initial` already reflects the new filters.
  const filterKey = params.toString();
  useEffect(() => {
    setItems(initial);
    setHasMore(initialHasMore);
    pageRef.current = 1;
  }, [initial, initialHasMore, filterKey]);

  useEffect(() => {
    if (!hasMore) return;
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const e = entries[0];
        if (!e || !e.isIntersecting || loading) return;
        setLoading(true);
        try {
          const { items: more, hasMore: nextHasMore } = await fetchMoreCatches(
            pageRef.current,
            params.toString(),
          );
          setItems((prev) => [...prev, ...more]);
          setHasMore(nextHasMore);
          pageRef.current += 1;
        } finally {
          setLoading(false);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, params]);

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <CatchesTable items={items} />
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <CatchCard item={item} />
          </li>
        ))}
      </ul>

      {hasMore ? (
        <div
          ref={sentinelRef}
          className="flex justify-center py-6 text-muted-foreground"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="text-xs">Przewijaj, by załadować więcej…</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
