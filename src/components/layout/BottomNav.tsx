"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

/**
 * Routes where bottom nav should hide — focused forms whose own sticky
 * save bar would otherwise fight for the bottom of the screen.
 */
const HIDDEN_ON = [
  /^\/trips\/new$/,
  /^\/trips\/[^/]+\/edit$/,
  /^\/trips\/[^/]+\/catch\/new$/,
  /^\/trips\/[^/]+\/catch\/[^/]+\/edit$/,
];

/**
 * Mobile bottom nav. 4 items, 56px tall, safe-area-aware so the icons
 * sit above the iOS home indicator.
 */
export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  if (HIDDEN_ON.some((re) => re.test(pathname))) return null;
  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur safe-area-pb",
        className,
      )}
      aria-label="Nawigacja"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 min-h-[44px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
