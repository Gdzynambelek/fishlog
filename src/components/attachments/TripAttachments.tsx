"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  uploadTripAttachment,
  deleteAttachmentFile,
} from "@/lib/storage";
import type { TripAttachment } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AttachmentItem extends TripAttachment {
  /** Server-computed signed URL for download. */
  signedUrl: string | null;
}

/**
 * Trip attachments — primarily PDFs of fishing permits. Click an item to
 * open the signed URL in a new tab. Owner can upload (max 10 MB) or delete.
 */
export function TripAttachments({
  tripId,
  initial,
}: {
  tripId: string;
  initial: AttachmentItem[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPick(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const meta = await uploadTripAttachment(file, tripId);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Brak sesji.");

      const { error } = await supabase.from("trip_attachments").insert({
        trip_id: tripId,
        user_id: user.id,
        file_path: meta.filePath,
        file_name: meta.fileName,
        file_size: meta.fileSize,
        mime_type: meta.mimeType,
      });
      if (error) {
        // Roll back the storage upload to avoid orphans.
        await deleteAttachmentFile(meta.filePath);
        throw new Error(error.message);
      }

      toast.success("Załącznik dodany.");
      router.refresh();
    } catch (err) {
      toast.error("Nie udało się dodać załącznika.", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(item: AttachmentItem) {
    if (!confirm(`Usunąć „${item.file_name}"?`)) return;
    const { error } = await supabase
      .from("trip_attachments")
      .delete()
      .eq("id", item.id);
    if (error) {
      toast.error("Nie udało się usunąć.", { description: error.message });
      return;
    }
    await deleteAttachmentFile(item.file_path);
    toast.success("Załącznik usunięty.");
    router.refresh();
  }

  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Pozwolenia / dokumenty</h3>
          <p className="text-xs text-muted-foreground">
            Dodaj PDF z pozwoleniem na łowienie lub innym dokumentem (max 10 MB).
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={onPick}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-4 w-4" />
          )}
          Dodaj PDF
        </Button>
      </div>

      {initial.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak załączników.</p>
      ) : (
        <ul className="space-y-2">
          {initial.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
            >
              <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(item.file_size)}
                </p>
              </div>
              {item.signedUrl ? (
                <a
                  href={item.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-primary hover:bg-muted"
                >
                  Otwórz
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Niedostępne
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item)}
                aria-label="Usuń załącznik"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
