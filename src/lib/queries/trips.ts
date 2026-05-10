import "server-only";
import { createClient } from "@/utils/supabase/server";
import type { Trip, Catch } from "@/types/database.types";

export type TripWithCount = Trip & { catches_count: number };

/**
 * List trips for the current user, newest first. Each trip is annotated
 * with the count of catches for use in list cards.
 */
export async function listTripsForUser(): Promise<TripWithCount[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*, catches(count)")
    .order("started_at", { ascending: false });

  if (error) throw new Error(`Failed to load trips: ${error.message}`);

  return (data ?? []).map((row) => {
    const { catches, ...trip } = row as Trip & {
      catches?: { count: number }[];
    };
    return { ...trip, catches_count: catches?.[0]?.count ?? 0 };
  });
}

/**
 * Recent trips for dashboard, capped at `limit`.
 */
export async function recentTrips(limit = 5): Promise<TripWithCount[]> {
  const all = await listTripsForUser();
  return all.slice(0, limit);
}

export async function getTripById(id: string): Promise<Trip | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load trip: ${error.message}`);
  return data ?? null;
}

export async function getCatchesForTrip(tripId: string): Promise<Catch[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("catches")
    .select("*")
    .eq("trip_id", tripId)
    .order("caught_at", { ascending: false });
  if (error) throw new Error(`Failed to load catches: ${error.message}`);
  return data ?? [];
}
