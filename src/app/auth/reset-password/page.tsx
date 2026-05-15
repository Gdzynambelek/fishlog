import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUser } from "@/utils/supabase/server";
import { ResetPasswordForm } from "./ResetPasswordForm";

/**
 * Password-reset landing page. The Supabase recovery email redirects users
 * through /auth/callback (PKCE exchange → cookies) and then here. If we see
 * a session, we render the new-password form; otherwise the link expired or
 * was opened in a different browser and we point the user back to /login.
 */
export default async function ResetPasswordPage() {
  const t = await getTranslations();
  const user = await getUser();

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-[hsl(168_38%_8%)] text-[hsl(60_50%_95%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, hsl(152 41% 30% / 0.45) 0%, transparent 70%), radial-gradient(50% 30% at 100% 100%, hsl(41 73% 66% / 0.18) 0%, transparent 60%)",
        }}
      />

      <div className="container flex min-h-svh flex-col items-center justify-center gap-8 py-10">
        <header className="flex flex-col items-center gap-2 text-center">
          <div className="text-5xl">🎣</div>
          <h1 className="text-3xl font-semibold tracking-tight">FishLog</h1>
        </header>

        {user ? (
          <Card className="w-full max-w-md border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur [&_label]:text-white/90">
            <h2 className="text-xl font-semibold">
              {t("auth.setNewPasswordTitle")}
            </h2>
            <p className="mt-1 text-sm text-white/70">
              {t("auth.setNewPasswordDescription")}
            </p>
            <ResetPasswordForm />
          </Card>
        ) : (
          <Card className="w-full max-w-md border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur">
            <h2 className="text-lg font-semibold">{t("auth.forgotPasswordTitle")}</h2>
            <p className="mt-2 text-sm text-white/70">
              {t("auth.resetSessionMissing")}
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/login">{t("auth.backToSignIn")}</Link>
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
}
