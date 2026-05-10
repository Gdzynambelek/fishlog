import "server-only";
import { createClient } from "@/utils/supabase/server";
import type { TripAttachment } from "@/types/database.types";

export async function listAttachmentsForTrip(
  tripId: string,
): Promise<TripAttachment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trip_attachments")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load attachments: ${error.message}`);
  return data ?? [];
}

/**
 * Generates a short-lived signed URL for downloading a private attachment.
 * Used in the trip detail page so we don't leak permanent URLs.
 */
export async function signedUrlForAttachment(
  filePath: string,
  expiresIn = 60 * 60, // 1h
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("trip-attachments")
    .createSignedUrl(filePath, expiresIn);
  if (error || !data) return null;
  return data.signedUrl;
}
