import type { Metadata } from "next";
import { LoginCard } from "./LoginCard";

export const metadata: Metadata = {
  title: "Logowanie",
  description: "Zaloguj się, by zacząć rejestrować swoje połowy.",
};

/**
 * Auth landing page. Renders branding + login card. The card is a client
 * component (handles form state + Supabase calls); branding stays server-side.
 */
export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirectedFrom?: string };
}) {
  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-[hsl(168_38%_8%)] text-[hsl(60_50%_95%)]">
      {/* Subtle radial accent — keeps the page from feeling flat. */}
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
          <p className="text-sm text-[hsl(60_30%_75%)]">
            Twój dziennik wędkarski
          </p>
        </header>

        <LoginCard
          oauthError={searchParams.error === "oauth"}
          redirectedFrom={searchParams.redirectedFrom}
        />

        <footer className="text-xs text-[hsl(60_20%_60%)]">
          © {new Date().getFullYear()} FishLog
        </footer>
      </div>
    </main>
  );
}
