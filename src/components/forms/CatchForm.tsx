"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { catchSchema, type CatchFormValues } from "@/lib/validation";
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

/**
 * Single-page catch form. Sticky bottom action bar on mobile so the save
 * button is always reachable while editing.
 */
export function CatchForm({ tripId }: { tripId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CatchFormValues>({
    resolver: zodResolver(catchSchema),
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
        toast.error("Sesja wygasła. Zaloguj się ponownie.");
        router.replace("/login");
        return;
      }

      if (photo) {
        try {
          uploadedUrl = await uploadCatchPhoto(photo, tripId);
        } catch (err) {
          toast.error("Nie udało się przesłać zdjęcia.", {
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
        // Clean up the orphan photo we just uploaded.
        if (uploadedUrl) await deleteCatchPhotoByUrl(uploadedUrl);
        toast.error("Nie udało się zapisać połowu.", {
          description: error.message,
        });
        return;
      }

      toast.success("Połów zapisany.");
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
                <FormLabel>Gatunek</FormLabel>
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
                  <FormLabel>Waga (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={0.05}
                      min={0}
                      inputMode="decimal"
                      placeholder="np. 2.45"
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
                  <FormLabel>Długość (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={0.5}
                      min={0}
                      inputMode="decimal"
                      placeholder="np. 42"
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
                <FormLabel>Data i czas złowienia</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="h-12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Card className="space-y-3 p-5">
          <Label>Zdjęcie</Label>
          <PhotoCapture file={photo} onChange={setPhoto} />
        </Card>

        <Card className="space-y-3 p-5">
          <Label>Lokalizacja złowienia (opcjonalna)</Label>
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
              form.setValue("longitude", longitude, { shouldValidate: true });
            }}
            description="Możesz wskazać dokładne miejsce, jeśli różni się od łowiska."
          />
        </Card>

        <Card className="space-y-4 p-5">
          <FormField
            control={form.control}
            name="released"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <FormLabel className="text-base">Wypuszczona?</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Zaznacz, jeśli ryba wróciła do wody.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Wypuszczona"
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
                <FormLabel>Notatki</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Przynęta, technika, warunki…"
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

        {/* Mobile: sit above the bottom-nav (z-40) by using z-50, so the
            save action stays reachable. Desktop (md+): static, in-flow. */}
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
              Zapisz połów
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
