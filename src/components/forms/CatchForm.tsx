"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
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

export function CatchForm({ tripId }: { tripId: string }) {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();
  const schema = useCatchSchema();
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CatchFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      species: "",
      weight_kg: null,
      length_cm: null,
      caught_at: toDatetimeLocalValue(new Date()),
      latitude: null,
      longitude: null,
      released: false,
      notes: "",
      photo_url: null,
    },
    mode: "onTouched",
  });

  async function onSubmit(values: CatchFormValues) {
    setSubmitting(true);
    let uploadedUrl: string | null = null;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t("errors.sessionExpired"));
        router.replace("/login");
        return;
      }

      if (photo) {
        try {
          uploadedUrl = await uploadCatchPhoto(photo, tripId);
        } catch (err) {
          toast.error(t("photo.uploadFailed"), {
            description: err instanceof Error ? err.message : undefined,
          });
          return;
        }
      }

      const insert = {
        trip_id: tripId,
        user_id: user.id,
        species: values.species.trim(),
        weight_kg: values.weight_kg,
        length_cm: values.length_cm,
        caught_at: fromDatetimeLocalValue(values.caught_at),
        latitude: values.latitude ?? null,
        longitude: values.longitude ?? null,
        released: values.released,
        notes: values.notes?.trim() || null,
        photo_url: uploadedUrl,
      };

      const { error } = await supabase.from("catches").insert(insert);
      if (error) {
        if (uploadedUrl) await deleteCatchPhotoByUrl(uploadedUrl);
        toast.error(t("catches.saveFailed"), {
          description: error.message,
        });
        return;
      }

      toast.success(t("catches.saved"));
      router.replace(`/trips/${tripId}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pb-32 md:pb-4"
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
                      placeholder="2.45"
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
                      placeholder="42"
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
          <PhotoCapture file={photo} onChange={setPhoto} />
        </Card>

        <Card className="space-y-3 p-5">
          <Label>{t("catches.fields.locationOptional")}</Label>
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
            description={t("catches.fields.locationHint")}
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
                    placeholder={t("catches.fields.notesPlaceholder")}
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

        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.15)] backdrop-blur safe-area-pb md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
          <div className="container flex justify-end md:px-0">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              {t("common.save")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
