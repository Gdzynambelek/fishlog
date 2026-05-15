"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { useLoginSchema, type LoginFormValues } from "@/lib/validation";
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
import { PasswordInput } from "@/components/ui/password-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "signin" | "signup" | "forgot";

/**
 * Email + password auth flows. Google OAuth was deliberately removed for now
 * — to re-enable, restore the "Continue with Google" button, signInWithGoogle
 * handler, and Google provider in Supabase Auth → Providers.
 */
export function LoginCard({
  redirectedFrom,
}: {
  redirectedFrom?: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();
  const schema = useLoginSchema();
  const [mode, setMode] = useState<Mode>("signin");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  // Separate form for the forgot-password view — only needs an email field.
  // Lives in the same component so a Tab switch doesn't unmount it.
  const forgotSchema = z.object({
    email: z.string().email(t("auth.errorInvalidCredentials")),
  });
  const forgotForm = useForm<{ email: string }>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword(values);
        if (error) {
          toast.error(t("auth.signInFailed"), {
            description: humanize(error.message, t),
          });
          return;
        }
        toast.success(t("auth.signedIn"));
        router.replace(redirectedFrom ?? "/dashboard");
        router.refresh();
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          toast.error(t("auth.signUpFailed"), {
            description: humanize(error.message, t),
          });
          return;
        }
        toast.success(t("auth.accountCreated"), {
          description: t("auth.accountCreatedDescription"),
        });
        setMode("signin");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onForgotSubmit(values: { email: string }) {
    setSubmitting(true);
    try {
      // Recovery link flows through /auth/callback (exchanges PKCE code for a
      // session cookie) and then forwards to /auth/reset-password where the
      // user picks a new password.
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`;
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo,
      });
      if (error) {
        toast.error(t("auth.resetRequestFailed"), { description: error.message });
        return;
      }
      // Always show success regardless of whether the email exists —
      // standard practice to not leak which addresses are registered.
      toast.success(t("auth.resetLinkSent"), {
        description: t("auth.resetLinkSentDescription"),
      });
      forgotForm.reset();
      setMode("signin");
    } finally {
      setSubmitting(false);
    }
  }

  // Forgot-password view replaces the tabs entirely — focused single-task screen.
  if (mode === "forgot") {
    return (
      <Card className="w-full max-w-md border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur [&_label]:text-white/90">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className="-ml-1 mb-3 inline-flex items-center gap-1 text-xs text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("auth.backToSignIn")}
        </button>
        <h2 className="text-xl font-semibold">
          {t("auth.forgotPasswordTitle")}
        </h2>
        <p className="mt-1 text-sm text-white/70">
          {t("auth.forgotPasswordDescription")}
        </p>
        <Form {...forgotForm}>
          <form
            onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
            className="mt-5 space-y-3"
            noValidate
          >
            <FormField
              control={forgotForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder={t("auth.emailPlaceholder")}
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
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.sendResetLink")}
            </Button>
          </form>
        </Form>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur [&_label]:text-white/90">
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger
            value="signin"
            className="text-white/70 data-[state=active]:bg-white data-[state=active]:text-[hsl(168_38%_12%)]"
          >
            {t("auth.signIn")}
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="text-white/70 data-[state=active]:bg-white data-[state=active]:text-[hsl(168_38%_12%)]"
          >
            {t("auth.signUp")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={mode} className="mt-5 space-y-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3"
              noValidate
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder={t("auth.emailPlaceholder")}
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.password")}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        autoComplete={
                          mode === "signin"
                            ? "current-password"
                            : "new-password"
                        }
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
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
              </Button>

              {mode === "signin" ? (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-white/70 underline-offset-2 hover:text-white hover:underline"
                  >
                    {t("auth.forgotPassword")}
                  </button>
                </div>
              ) : null}
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function humanize(msg: string, t: (key: string) => string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login")) return t("auth.errorInvalidCredentials");
  if (lower.includes("email not confirmed"))
    return t("auth.errorEmailNotConfirmed");
  if (lower.includes("user already registered"))
    return t("auth.errorUserAlreadyRegistered");
  return msg;
}
