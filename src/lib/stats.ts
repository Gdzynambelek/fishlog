import "server-only";
import { createClient } from "@/utils/supabase/server";
import type { Catch } from "@/types/database.types";

export interface UserStats {
  totalCatches: number;
  totalTrips: number;
  largestFish: { species: string; weight_kg: number } | null;
  favoriteSpecies: string | null;
}

/**
 * Aggregate stats for the dashboard / profile.
 *
 * All catches are pulled in one query — for a single user this is bounded
 * (a hobby angler isn't logging 100k catches). If we ever need to scale,
 * this is the place to push aggregations into a SQL view or RPC.
 */
export async function getStatsForUser(): Promise<UserStats> {
  const supabase = createClient();

  const [{ data: catches, error: catchErr }, { count: tripCount, error: tripErr }] =
    await Promise.all([
      supabase
        .from("catches")
        .select("species, weight_kg")
        .order("weight_kg", { ascending: false, nullsFirst: false }),
      supabase
        .from("trips")
        .select("*", { count: "exact", head: true }),
    ]);

  if (catchErr) throw new Error(catchErr.message);
  if (tripErr) throw new Error(tripErr.message);

  const list = catches ?? [];
  const largest = list.find((c) => typeof c.weight_kg === "number");

  // Favorite = most-frequent species. Ties broken by alphabetical order
  // for deterministic output.
  const counts = new Map<string, number>();
  for (const c of list) {
    counts.set(c.species, (counts.get(c.species) ?? 0) + 1);
  }
  let favorite: string | null = null;
  let favCount = -1;
  for (const [species, count] of counts) {
    if (count > favCount || (count === favCount && favorite && species < favorite)) {
      favorite = species;
      favCount = count;
    }
  }

  return {
    totalCatches: list.length,
    totalTrips: tripCount ?? 0,
    largestFish:
      largest && typeof largest.weight_kg === "number"
        ? { species: largest.species, weight_kg: largest.weight_kg }
        : null,
    favoriteSpecies: favorite,
  };
}

export interface TripStats {
  totalCatches: number;
  totalWeightKg: number;
  largestFish: { species: string; weight_kg: number } | null;
}

export function computeTripStats(catches: Catch[]): TripStats {
  const totalCatches = catches.length;
  const totalWeightKg = catches.reduce(
    (sum, c) => sum + (c.weight_kg ?? 0),
    0,
  );
  const largest = catches
    .filter((c): c is Catch & { weight_kg: number } => c.weight_kg !== null)
    .sort((a, b) => b.weight_kg - a.weight_kg)[0];

  return {
    totalCatches,
    totalWeightKg,
    largestFish: largest
      ? { species: largest.species, weight_kg: largest.weight_kg }
      : null,
  };
}

export interface TopFishItem {
  id: string;
  trip_id: string;
  species: string;
  weight_kg: number;
  caught_at: string;
  photo_url: string | null;
}

/**
 * Top N heaviest fish — used in dashboard "Top X" section. Returns rows
 * with `weight_kg` not null, ordered desc. Caller picks the limit.
 */
export async function getTopFish(limit = 3): Promise<TopFishItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("catches")
    .select("id, trip_id, species, weight_kg, caught_at, photo_url")
    .not("weight_kg", "is", null)
    .order("weight_kg", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).filter(
    (r): r is TopFishItem => typeof r.weight_kg === "number",
  );
}

export interface SpeciesRankItem {
  species: string;
  count: number;
  totalWeightKg: number;
}

export async function getSpeciesRanking(): Promise<SpeciesRankItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("catches")
    .select("species, weight_kg");
  if (error) throw new Error(error.message);

  const map = new Map<string, SpeciesRankItem>();
  for (const c of data ?? []) {
    const cur = map.get(c.species) ?? {
      species: c.species,
      count: 0,
      totalWeightKg: 0,
    };
    cur.count += 1;
    cur.totalWeightKg += c.weight_kg ?? 0;
    map.set(c.species, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
