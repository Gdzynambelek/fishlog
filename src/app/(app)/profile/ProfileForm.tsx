"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  useProfileSchema,
  type ProfileFormValues,
} from "@/lib/validation";
import type { Profile } from "@/types/database.types";
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

export function ProfileForm({ profile }: { profile: Profile }) {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();
  const schema = useProfileSchema();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      fishing_license: profile.fishing_license ?? "",
      permit_links: profile.permit_links ?? [],
    },
    mode: "onTouched",
  });

  const links = useFieldArray({
    control: form.control,
    name: "permit_links",
  });

  async function onSubmit(values: ProfileFormValues) {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name?.trim() || null,
          last_name: values.last_name?.trim() || null,
          fishing_license: values.fishing_license?.trim() || null,
          permit_links: values.permit_links.map((l) => ({
            label: l.label.trim(),
            url: l.url.trim(),
          })),
        })
        .eq("id", profile.id);
      if (error) {
        toast.error(t("profile.saveFailed"), {
          description: error.message,
        });
        return;
      }
      toast.success(t("profile.saved"));
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
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.fields.firstName")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="given-name"
                      className="h-11"
                      placeholder={t("profile.fields.firstNamePlaceholder")}
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
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.fields.lastName")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="family-name"
                      className="h-11"
                      placeholder={t("profile.fields.lastNamePlaceholder")}
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

          <FormField
            control={form.control}
            name="fishing_license"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.fields.fishingLicense")}</FormLabel>
                <FormControl>
                  <Input
                    className="h-11"
                    placeholder={t("profile.fields.fishingLicensePlaceholder")}
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

        <Card className="space-y-3 p-5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">
                {t("profile.permitLinksSectionTitle")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("profile.permitLinksHint")}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => links.append({ label: "", url: "" })}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              {t("common.add")}
            </Button>
          </div>

          {links.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("profile.noLinks")}
            </p>
          ) : (
            <ul className="space-y-3">
              {links.fields.map((field, i) => (
                <li
                  key={field.id}
                  className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_2fr_auto]"
                >
                  <FormField
                    control={form.control}
                    name={`permit_links.${i}.label`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t("profile.linkLabelPlaceholder")}
                            className="h-10"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`permit_links.${i}.url`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="url"
                            inputMode="url"
                            placeholder={t("profile.linkUrlPlaceholder")}
                            className="h-10"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => links.remove(i)}
                    aria-label={t("profile.deleteLink")}
                    className="self-start"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function PermitLinksList({
  links,
}: {
  links: { label: string; url: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <ul className="space-y-2">
      {links.map((link, i) => (
        <li key={i}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {link.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
