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
 * Error messages here intentionally stay in English; callers re-wrap with
 * localized toast text (we don't import `useTranslations` here because this
 * module is also called from non-React contexts).
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
    throw new Error("Auth required");
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
    throw new Error(uploadErr.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}

export async function deleteCatchPhotoByUrl(url: string): Promise<void> {
  try {
    const supabase = createClient();
    const path = extractPathFromPublicUrl(url);
    if (!path) return;
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // best-effort
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

export async function uploadTripAttachment(
  file: File,
  tripId: string,
): Promise<UploadedAttachment> {
  if (!ALLOWED_ATTACHMENT_MIME.includes(file.type)) {
    throw new Error("Only PDF allowed");
  }
  if (file.size > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024) {
    throw new Error(`File too large (max ${MAX_ATTACHMENT_SIZE_MB} MB)`);
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    throw new Error("Auth required");
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
    throw new Error(uploadErr.message);
  }

  return {
    filePath,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}

export async function deleteAttachmentFile(filePath: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.storage.from(ATTACHMENTS_BUCKET).remove([filePath]);
  } catch {
    // best-effort
  }
}
