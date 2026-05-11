"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";

const MAX_INPUT_SIZE_MB = 25;

export function PhotoCapture({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function onPick(ev: React.ChangeEvent<HTMLInputElement>) {
    const picked = ev.target.files?.[0];
    ev.target.value = "";
    if (!picked) return;

    if (picked.size > MAX_INPUT_SIZE_MB * 1024 * 1024) {
      toast.error(t("photo.tooLarge"));
      return;
    }
    if (!picked.type.startsWith("image/")) {
      toast.error(t("photo.notImage"));
      return;
    }

    setBusy(true);
    try {
      const compressed = await imageCompression(picked, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      const renamed = new File(
        [compressed],
        picked.name.replace(/\.\w+$/, ".jpg"),
        { type: "image/jpeg" },
      );
      onChange(renamed);
    } catch (err) {
      toast.error(t("photo.processFailed"), {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onPick}
        aria-label={t("photo.captureLabel")}
      />

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={previewUrl}
            alt={t("photo.preview")}
            width={800}
            height={600}
            className="h-auto w-full object-cover"
            unoptimized
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={clear}
            className="absolute right-2 top-2 gap-1 bg-background/90 backdrop-blur"
          >
            <X className="h-4 w-4" />
            {t("common.remove")}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-24 w-full gap-2 border-dashed text-base"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
          {t("photo.captureLabel")}
        </Button>
      )}
    </div>
  );
}
