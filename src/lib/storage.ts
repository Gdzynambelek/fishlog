"use client";

import imageCompression from "browser-image-compression";
import { createClient } from "@/utils/supabase/client";

const BUCKET = "catches-photos";
const MAX_SIZE_MB = 1;
const MAX_DIM = 1920;

/**
 * Compresses a photo (≤1MB / 1920px) and uploads to the catches-photos
 * bucket under `{user_id}/{trip_id}/{uuid}.jpg`. Returns the public URL.
 *
 * Compression matters: phones easily produce 5–10MB JPEGs. Without this
 * we'd burn the Supabase free tier in days.
 */
export async function uploadCatchPhoto(
  file: File,
  tripId: string,
): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    throw new Error("Musisz być zalogowany, by przesłać zdjęcie.");
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_DIM,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  const ext = "jpg";
  const path = `${user.id}/${tripId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, {
      cacheControl: "3600",
      upsert: false,
      contentType: "image/jpeg",
    });
  if (uploadErr) {
    throw new Error(`Nie udało się przesłać zdjęcia: ${uploadErr.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}

/**
 * Best-effort cleanup. Used when the catch save fails after the photo
 * already uploaded — orphan photos waste storage. Failure here is non-fatal.
 */
export async function deleteCatchPhotoByUrl(url: string): Promise<void> {
  try {
    const supabase = createClient();
    const path = extractPathFromPublicUrl(url);
    if (!path) return;
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Swallow — deletion best-effort.
  }
}

function extractPathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

const ATTACHMENTS_BUCKET = "trip-attachments";
const MAX_ATTACHMENT_SIZE_MB = 10;
const ALLOWED_ATTACHMENT_MIME = ["application/pdf"];

export interface UploadedAttachment {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Uploads a PDF (e.g. fishing permit) to the private trip-attachments bucket
 * under `{user_id}/{trip_id}/{uuid}.pdf`. Returns metadata for the caller to
 * insert a row in `trip_attachments`.
 */
export async function uploadTripAttachment(
  file: File,
  tripId: string,
): Promise<UploadedAttachment> {
  if (!ALLOWED_ATTACHMENT_MIME.includes(file.type)) {
    throw new Error("Tylko pliki PDF są dozwolone.");
  }
  if (file.size > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024) {
    throw new Error(`Plik za duży (max ${MAX_ATTACHMENT_SIZE_MB} MB).`);
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    throw new Error("Musisz być zalogowany, by dodać załącznik.");
  }

  const filePath = `${user.id}/${tripId}/${crypto.randomUUID()}.pdf`;
  const { error: uploadErr } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: "application/pdf",
    });
  if (uploadErr) {
    throw new Error(`Upload nie powiódł się: ${uploadErr.message}`);
  }

  return {
    filePath,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}

/** Removes an attachment file from Storage (best-effort). */
export async function deleteAttachmentFile(filePath: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.storage.from(ATTACHMENTS_BUCKET).remove([filePath]);
  } catch {
    // Best-effort.
  }
}
