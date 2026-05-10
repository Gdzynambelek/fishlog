import type { User } from "@supabase/supabase-js";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

/**
 * Responsive shell:
 *  - mobile (<md): main column + fixed bottom nav.
 *  - tablet/desktop (≥md): sticky sidebar on the left + content column.
 *
 * We use CSS-only switching (Tailwind responsive utilities) so SSR doesn't
 * flicker between layouts on first paint.
 */
export function Shell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar user={user} className="hidden md:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="container flex-1 py-4 pb-24 md:py-8 md:pb-8">
          {children}
        </main>

        <BottomNav className="md:hidden" />
      </div>
    </div>
  );
}
