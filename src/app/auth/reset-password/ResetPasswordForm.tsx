"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm() {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);

  // Schema with cross-field check that the two passwords match.
  const schema = z
    .object({
      password: z
        .string()
        .min(8, t("auth.errorInvalidCredentials"))
        .max(128),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      path: ["confirmPassword"],
      message: t("auth.passwordsDoNotMatch"),
    });

  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });
      if (error) {
        toast.error(t("auth.passwordChangeFailed"), {
          description: error.message,
        });
        return;
      }
      toast.success(t("auth.passwordChanged"));
      router.replace("/dashboard");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-5 space-y-3"
        noValidate
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.newPassword")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  className="h-11 border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.confirmPassword")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  className="h-11 border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {t("auth.savePassword")}
        </Button>
      </form>
    </Form>
  );
}
