"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { tripSchema, type TripFormValues } from "@/lib/validation";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/format";
import type { Trip } from "@/types/database.types";
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
import { LocationPicker } from "@/components/maps/LocationPicker";

/**
 * Single-page edit form. Pre-fills from existing trip; uses the same zod
 * schema as the stepper used for creation, so validation rules match.
 */
export function TripEditForm({ trip }: { trip: Trip }) {
  const router = useRouter();
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: trip.name,
      location_name: trip.location_name ?? "",
      latitude: trip.latitude,
      longitude: trip.longitude,
      started_at: toDatetimeLocalValue(new Date(trip.started_at)),
      ended_at: trip.ended_at
        ? toDatetimeLocalValue(new Date(trip.ended_at))
        : "",
      notes: trip.notes ?? "",
      weather: trip.weather ?? "",
    },
    mode: "onTouched",
  });

  async function onSubmit(values: TripFormValues) {
    setSubmitting(true);
    try {
      const update = {
        name: values.name.trim(),
        location_name: values.location_name?.trim() || null,
        latitude: values.latitude ?? null,
        longitude: values.longitude ?? null,
        started_at: fromDatetimeLocalValue(values.started_at),
        ended_at: values.ended_at
          ? fromDatetimeLocalValue(values.ended_at)
          : null,
        notes: values.notes?.trim() || null,
        weather: values.weather?.trim() || null,
      };
      const { error } = await supabase
        .from("trips")
        .update(update)
        .eq("id", trip.id);
      if (error) {
        toast.error("Nie udało się zapisać zmian.", {
          description: error.message,
        });
        return;
      }
      toast.success("Wyjazd zaktualizowany.");
      router.replace(`/trips/${trip.id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa wyjazdu</FormLabel>
                <FormControl>
                  <Input className="h-12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="started_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rozpoczęcie</FormLabel>
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
            <FormField
              control={form.control}
              name="ended_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zakończenie (opcjonalne)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      className="h-12"
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
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <FormField
            control={form.control}
            name="location_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opis miejsca</FormLabel>
                <FormControl>
                  <Input
                    className="h-12"
                    placeholder="np. Jeziorko za lasem"
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
          <div className="space-y-2">
            <Label>Lokalizacja na mapie</Label>
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
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <FormField
            control={form.control}
            name="weather"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pogoda</FormLabel>
                <FormControl>
                  <Input
                    className="h-12"
                    placeholder="np. Słonecznie, 18°C"
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
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notatki</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
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
            Anuluj
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            Zapisz zmiany
          </Button>
        </div>
      </form>
    </Form>
  );
}
