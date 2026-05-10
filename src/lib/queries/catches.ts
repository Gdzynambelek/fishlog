import "server-only";
import { createClient } from "@/utils/supabase/server";
import type { Catch } from "@/types/database.types";

export type CatchSort = "caught_at" | "weight_kg" | "length_cm";

export interface CatchFilters {
  species?: string[];
  fromDate?: string;
  toDate?: string;
  minWeight?: number;
  withPhotoOnly?: boolean;
}

export interface CatchWithTripName extends Catch {
  trip_name: string | null;
}

const PAGE_SIZE = 20;

/**
 * Paginated catches for the current user. Filters and sort are applied
 * server-side; pagination uses Supabase's `range()`.
 *
 * `page` is 0-indexed.
 */
export async function listCatchesForUser(
  page = 0,
  sort: CatchSort = "caught_at",
  ascending = false,
  filters: CatchFilters = {},
): Promise<{ items: CatchWithTripName[]; hasMore: boolean }> {
  const supabase = createClient();
  let q = supabase
    .from("catches")
    .select("*, trips(name)", { count: "exact" });

  if (filters.species && filters.species.length > 0) {
    q = q.in("species", filters.species);
  }
  if (filters.fromDate) q = q.gte("caught_at", filters.fromDate);
  if (filters.toDate) q = q.lte("caught_at", filters.toDate);
  if (typeof filters.minWeight === "number" && filters.minWeight > 0) {
    q = q.gte("weight_kg", filters.minWeight);
  }
  if (filters.withPhotoOnly) q = q.not("photo_url", "is", null);

  q = q.order(sort, { ascending, nullsFirst: false });

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error, count } = await q.range(from, to);
  if (error) throw new Error(`Failed to load catches: ${error.message}`);

  const items: CatchWithTripName[] = (data ?? []).map((row) => {
    const { trips, ...rest } = row as Catch & {
      trips?: { name: string } | null;
    };
    return { ...rest, trip_name: trips?.name ?? null };
  });
  const hasMore = count !== null ? to + 1 < count : items.length === PAGE_SIZE;
  return { items, hasMore };
}

export async function recentCatches(limit = 3): Promise<CatchWithTripName[]> {
  const { items } = await listCatchesForUser(0, "caught_at", false, {});
  return items.slice(0, limit);
}
