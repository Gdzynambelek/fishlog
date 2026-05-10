"use client";

import { createClient } from "@/utils/supabase/client";
import type { Catch } from "@/types/database.types";
import type { CatchSort, CatchWithTripName } from "./catches";

const PAGE_SIZE = 20;

/**
 * Client-side counterpart of `listCatchesForUser` — used by the infinite
 * scroller to fetch subsequent pages without round-tripping to a server
 * action. Reads the same filter params from the URL.
 */
export async function fetchMoreCatches(
  page: number,
  searchParams: string,
): Promise<{ items: CatchWithTripName[]; hasMore: boolean }> {
  const supabase = createClient();
  const usp = new URLSearchParams(searchParams);

  const sort = (usp.get("sort") as CatchSort) ?? "caught_at";
  const ascending = usp.get("dir") === "asc";
  const speciesList = usp.getAll("species");
  const fromDate = usp.get("from");
  const toDate = usp.get("to");
  const minWeight = usp.get("minw");
  const withPhotoOnly = usp.get("photo") === "1";

  let q = supabase
    .from("catches")
    .select("*, trips(name)", { count: "exact" });

  if (speciesList.length > 0) q = q.in("species", speciesList);
  if (fromDate) q = q.gte("caught_at", fromDate);
  if (toDate) q = q.lte("caught_at", toDate);
  if (minWeight) {
    const n = Number(minWeight);
    if (Number.isFinite(n) && n > 0) q = q.gte("weight_kg", n);
  }
  if (withPhotoOnly) q = q.not("photo_url", "is", null);

  q = q.order(sort, { ascending, nullsFirst: false });

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error, count } = await q.range(from, to);
  if (error) throw new Error(error.message);

  const items: CatchWithTripName[] = (data ?? []).map((row) => {
    const { trips, ...rest } = row as Catch & {
      trips?: { name: string } | null;
    };
    return { ...rest, trip_name: trips?.name ?? null };
  });
  const hasMore = count !== null ? to + 1 < count : items.length === PAGE_SIZE;
  return { items, hasMore };
}
