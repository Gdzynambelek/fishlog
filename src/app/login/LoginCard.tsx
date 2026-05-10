"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { loginSchema, type LoginFormValues } from "@/lib/validation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

type Mode = "signin" | "signup";

export function LoginCard({
  oauthError,
  redirectedFrom,
}: {
  oauthError?: boolean;
  redirectedFrom?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("signin");
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    if (oauthError) {
      toast.error("Logowanie przez Google nie powiodło się. Spróbuj ponownie.");
    }
  }, [oauthError]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword(values);
        if (error) {
          toast.error("Nie udało się zalogować.", {
            description: humanizeAuthError(error.message),
          });
          return;
        }
        toast.success("Zalogowano. Witaj z powrotem!");
        router.replace(redirectedFrom ?? "/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          toast.error("Nie udało się utworzyć konta.", {
            description: humanizeAuthError(error.message),
          });
          return;
        }
        toast.success("Konto utworzone!", {
          description: "Sprawdź skrzynkę e-mail i potwierdź adres.",
        });
        setMode("signin");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function signInWithGoogle() {
    setOauthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectedFrom ?? "/dashboard")}`,
      },
    });
    if (error) {
      setOauthLoading(false);
      toast.error("Logowanie przez Google nie powiodło się.", {
        description: error.message,
      });
    }
    // On success the browser is redirected by Supabase; loading state stays.
  }

  return (
    <Card className="w-full max-w-md border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur [&_label]:text-white/90">
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger
            value="signin"
            className="text-white/70 data-[state=active]:bg-white data-[state=active]:text-[hsl(168_38%_12%)]"
          >
            Zaloguj się
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="text-white/70 data-[state=active]:bg-white data-[state=active]:text-[hsl(168_38%_12%)]"
          >
            Utwórz konto
          </TabsTrigger>
        </TabsList>

        <TabsContent value={mode} className="mt-5 space-y-4">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={oauthLoading || submitting}
            onClick={signInWithGoogle}
          >
            {oauthLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            Kontynuuj przez Google
          </Button>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <Separator className="flex-1 bg-white/15" />
            lub przez e-mail
            <Separator className="flex-1 bg-white/15" />
          </div>

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
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="ty@example.com"
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
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
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
                disabled={submitting || oauthLoading}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Zaloguj się" : "Utwórz konto"}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function humanizeAuthError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login")) return "Nieprawidłowy e-mail lub hasło.";
  if (lower.includes("email not confirmed"))
    return "Adres e-mail nie został potwierdzony.";
  if (lower.includes("user already registered"))
    return "Konto z tym adresem już istnieje. Spróbuj się zalogować.";
  return msg;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-3-.4-4.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.1l6.6 4.8C14.7 15 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5c-7.8 0-14.5 4.5-17.7 9.6z"
      />
      <path
        fill="#4CAF50"
        d="M24 45.5c5.5 0 10.5-2 14.3-5.3l-6.6-5.4c-2 1.4-4.6 2.2-7.7 2.2-5.3 0-9.7-3.4-11.3-8l-6.6 5C9.4 41 16.2 45.5 24 45.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.6 5l6.6 5.4c4.4-4 7.2-10.1 7.2-17 0-1.5-.2-3-.4-4.5z"
      />
    </svg>
  );
}
