"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar({
  user,
  className,
}: {
  user: User;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Wylogowano. Do zobaczenia!");
    router.replace("/login");
    router.refresh();
  }

  const display = displayInfo(user);

  return (
    <aside
      className={cn(
        "sticky top-0 h-svh w-[72px] shrink-0 flex-col border-r border-border bg-card lg:w-[240px]",
        className,
      )}
    >
      <Link
        href="/dashboard"
        className="flex h-16 items-center gap-2 px-4 text-primary"
      >
        <span className="text-2xl">🎣</span>
        <span className="hidden text-lg font-semibold tracking-tight lg:inline">
          FishLog
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                "lg:px-3",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground",
              )}
              title={label}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2 lg:p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-2 lg:gap-3">
          <Avatar className="h-8 w-8">
            {display.avatarUrl ? (
              <AvatarImage src={display.avatarUrl} alt={display.name} />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {display.initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-sm font-medium">{display.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            aria-label="Wyloguj się"
            className="lg:ml-auto"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

function displayInfo(user: User) {
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Użytkownik";
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return { name, avatarUrl, initials: initials || "?" };
}
