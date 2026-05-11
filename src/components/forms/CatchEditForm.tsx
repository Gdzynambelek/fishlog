"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useCatchSchema, type CatchFormValues } from "@/lib/validation";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/format";
import {
  uploadCatchPhoto,
  deleteCatchPhotoByUrl,
} from "@/lib/storage";
import type { Catch, CatchUpdate } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LocationPicker } from "@/components/maps/LocationPicker";
import { SpeciesAutocomplete } from "./SpeciesAutocomplete";
import { PhotoCapture } from "./PhotoCapture";

type PhotoMode = "keep" | "replace" | "remove";

export function CatchEditForm({ existing }: { existing: Catch }) {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();
  const schema = useCatchSchema();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoMode, setPhotoMode] = useState<PhotoMode>("keep");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CatchFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      species: existing.species,
      weight_kg: existing.weight_kg,
      length_cm: existing.length_cm,
      caught_at: toDatetimeLocalValue(new Date(existing.caught_at)),
      latitude: existing.latitude,
      longitude: existing.longitude,
      released: existing.released,
      notes: existing.notes ?? "",
      photo_url: existing.photo_url,
    },
    mode: "onTouched",
  });

  function onPhotoChange(f: File | null) {
    setPhotoFile(f);
    setPhotoMode(f ? "replace" : "keep");
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhotoMode("remove");
  }

  async function onSubmit(values: CatchFormValues) {
    setSubmitting(true);
    let newUrl: string | null = null;
    try {
      if (photoMode === "replace" && photoFile) {
        try {
          newUrl = await uploadCatchPhoto(photoFile, existing.trip_id);
        } catch (err) {
          toast.error(t("photo.uploadNewFailed"), {
            description: err instanceof Error ? err.message : undefined,
          });
          return;
        }
      }

      const update: CatchUpdate = {
        species: values.species.trim(),
        weight_kg: values.weight_kg,
        length_cm: values.length_cm,
        caught_at: fromDatetimeLocalValue(values.caught_at),
        latitude: values.latitude ?? null,
        longitude: values.longitude ?? null,
        released: values.released,
        notes: values.notes?.trim() || null,
      };
      if (photoMode === "replace") update.photo_url = newUrl;
      else if (photoMode === "remove") update.photo_url = null;

      const { error } = await supabase
        .from("catches")
        .update(update)
        .eq("id", existing.id);

      if (error) {
        if (newUrl) await deleteCatchPhotoByUrl(newUrl);
        toast.error(t("catches.updateFailed"), {
          description: error.message,
        });
        return;
      }

      if (
        (photoMode === "replace" || photoMode === "remove") &&
        existing.photo_url
      ) {
        await deleteCatchPhotoByUrl(existing.photo_url);
      }

      toast.success(t("catches.updated"));
      router.replace(`/trips/${existing.trip_id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const showExistingPhoto =
    photoMode === "keep" && existing.photo_url && !photoFile;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Card className="space-y-4 p-5">
          <FormField
            control={form.control}
            name="species"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("catches.fields.species")}</FormLabel>
                <FormControl>
                  <SpeciesAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="weight_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("catches.fields.weightKg")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={0.05}
                      min={0}
                      inputMode="decimal"
                      className="h-12"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? null : Number(v));
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="length_cm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("catches.fields.lengthCm")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={0.5}
                      min={0}
                      inputMode="decimal"
                      className="h-12"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? null : Number(v));
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="caught_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("catches.fields.caughtAt")}</FormLabel>
                <FormControl>
                  <Input type="datetime-local" className="h-12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Card className="space-y-3 p-5">
          <Label>{t("catches.fields.photo")}</Label>
          {showExistingPhoto && existing.photo_url ? (
            <div className="space-y-2">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
                <Image
                  src={existing.photo_url}
                  alt={t("photo.current")}
                  width={800}
                  height={600}
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPhotoMode("replace")}
                >
                  {t("photo.replace")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removePhoto}
                  className="text-destructive"
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  {t("photo.remove")}
                </Button>
              </div>
            </div>
          ) : photoMode === "remove" ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("photo.deleteOnSave")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPhotoMode("keep")}
              >
                {t("photo.undo")}
              </Button>
            </div>
          ) : (
            <PhotoCapture file={photoFile} onChange={onPhotoChange} />
          )}
        </Card>

        <Card className="space-y-3 p-5">
          <Label>{t("catches.fields.location")}</Label>
          <LocationPicker
            value={
              form.watch("latitude") != null &&
              form.watch("longitude") != null
                ? {
                    latitude: form.watch("latitude") as number,
                    longitude: form.watch("longitude") as number,
                  }
                : null
            }
            onChange={({ latitude, longitude }) => {
              form.setValue("latitude", latitude, { shouldValidate: true });
              form.setValue("longitude", longitude, {
                shouldValidate: true,
              });
            }}
          />
        </Card>

        <Card className="space-y-4 p-5">
          <FormField
            control={form.control}
            name="released"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <FormLabel className="text-base">
                    {t("catches.fields.released")}
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    {t("catches.fields.releasedHint")}
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={t("catches.fields.released")}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("catches.fields.notes")}</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={submitting}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            {t("common.saveChanges")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
