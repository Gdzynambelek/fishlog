import "server-only";
import { createClient } from "@/utils/supabase/server";
import type { Profile } from "@/types/database.types";

/**
 * Fetch the current user's profile. The DB trigger creates a profile row on
 * signup, but for safety we coalesce to a synthetic empty profile if missing.
 */
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load profile: ${error.message}`);
  if (data) return data;

  // Fallback — create on demand (trigger should have done this already).
  const { data: created, error: insertErr } = await supabase
    .from("profiles")
    .insert({ id: user.id })
    .select("*")
    .single();
  if (insertErr) throw new Error(insertErr.message);
  return created;
}

/**
 * Display name resolution: profile first_name + last_name → user metadata
 * (Google) → email local-part → fallback. Used in greetings.
 */
export function resolveDisplayName(
  profile: Pick<Profile, "first_name" | "last_name"> | null,
  user: { email?: string | null; user_metadata?: Record<string, unknown> },
  fallback = "Wędkarzu",
): string {
  const first = profile?.first_name?.trim();
  const last = profile?.last_name?.trim();
  if (first && last) return `${first} ${last}`;
  if (first) return first;

  const meta = user.user_metadata ?? {};
  const fullName =
    (meta["full_name"] as string | undefined) ??
    (meta["name"] as string | undefined);
  if (fullName) return fullName;

  if (user.email) return user.email.split("@")[0] ?? fallback;
  return fallback;
}

/** First name only — used for "Cześć, X! 👋" greeting. */
export function resolveGreetingName(
  profile: Pick<Profile, "first_name"> | null,
  user: { email?: string | null; user_metadata?: Record<string, unknown> },
  fallback = "wędkarzu",
): string {
  const first = profile?.first_name?.trim();
  if (first) return first;
  const meta = user.user_metadata ?? {};
  const fullName =
    (meta["full_name"] as string | undefined) ??
    (meta["name"] as string | undefined);
  if (fullName) return fullName.split(/\s+/)[0] ?? fallback;
  if (user.email) return user.email.split("@")[0] ?? fallback;
  return fallback;
}
