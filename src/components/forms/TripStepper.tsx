"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useTripSchema, type TripFormValues } from "@/lib/validation";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/format";
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

export function TripStepper() {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();
  const schema = useTripSchema();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  const STEPS = [
    { id: 1, label: t("trips.steps.basicInfo") },
    { id: 2, label: t("trips.steps.location") },
    { id: 3, label: t("trips.steps.notes") },
  ] as const;

  const form = useForm<TripFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      location_name: "",
      latitude: null,
      longitude: null,
      started_at: toDatetimeLocalValue(new Date()),
      ended_at: "",
      notes: "",
      weather: "",
    },
    mode: "onTouched",
  });

  const fieldsByStep: Record<typeof step, (keyof TripFormValues)[]> = {
    1: ["name", "started_at", "ended_at"],
    2: ["location_name", "latitude", "longitude"],
    3: ["notes", "weather"],
  };

  async function next() {
    const valid = await form.trigger(fieldsByStep[step]);
    if (!valid) return;
    setStep((s) => (s < 3 ? ((s + 1) as typeof step) : s));
  }

  function prev() {
    setStep((s) => (s > 1 ? ((s - 1) as typeof step) : s));
  }

  async function onSubmit(values: TripFormValues) {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t("errors.sessionExpired"));
        router.replace("/login");
        return;
      }

      const insert = {
        user_id: user.id,
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

      const { data, error } = await supabase
        .from("trips")
        .insert(insert)
        .select("id")
        .single();
      if (error) {
        toast.error(t("trips.saveFailed"), {
          description: error.message,
        });
        return;
      }

      toast.success(t("trips.saved"));
      router.replace(`/trips/${data.id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <ol className="flex items-center justify-between gap-2">
          {STEPS.map((s, i) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <li
                key={s.id}
                className="flex flex-1 items-center gap-2 text-xs sm:text-sm"
              >
                <span
                  className={
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                    (done || active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {s.id}
                </span>
                <span
                  className={
                    "hidden sm:inline " +
                    (active ? "font-medium" : "text-muted-foreground")
                  }
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 ? (
                  <span className="ml-2 hidden h-px flex-1 bg-border sm:block" />
                ) : null}
              </li>
            );
          })}
        </ol>

        <Card className="overflow-hidden p-5">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("trips.fields.name")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("trips.fields.namePlaceholder")}
                          className="h-12"
                          autoFocus
                          {...field}
                        />
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
                        <FormLabel>{t("trips.fields.started")}</FormLabel>
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
                        <FormLabel>
                          {t("trips.fields.ended")} {t("common.optional")}
                        </FormLabel>
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
              </motion.div>
            ) : null}

            {step === 2 ? (
              <motion.div
                key="step2"
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="location_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("trips.fields.locationName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("trips.fields.locationNamePlaceholder")}
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
                <div className="space-y-2">
                  <Label>{t("trips.fields.mapLocation")}</Label>
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
                      form.setValue("latitude", latitude, {
                        shouldValidate: true,
                      });
                      form.setValue("longitude", longitude, {
                        shouldValidate: true,
                      });
                    }}
                  />
                </div>
              </motion.div>
            ) : null}

            {step === 3 ? (
              <motion.div
                key="step3"
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="weather"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("trips.fields.weather")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("trips.fields.weatherPlaceholder")}
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
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("trips.fields.notes")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("trips.fields.notesPlaceholder")}
                          rows={6}
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
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={prev}
            disabled={step === 1 || submitting}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {t("common.back")}
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={next} disabled={submitting}>
              {t("common.next")}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              {t("common.save")}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
