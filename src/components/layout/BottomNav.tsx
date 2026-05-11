"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

const HIDDEN_ON = [
  /^\/trips\/new$/,
  /^\/trips\/[^/]+\/edit$/,
  /^\/trips\/[^/]+\/catch\/new$/,
  /^\/trips\/[^/]+\/catch\/[^/]+\/edit$/,
];

export function BottomNav({ className }: { className?: string }) {
  const t = useTranslations();
  const pathname = usePathname();
  if (HIDDEN_ON.some((re) => re.test(pathname))) return null;
  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur safe-area-pb",
        className,
      )}
      aria-label={t("nav.label")}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          const label = t(`nav.${labelKey}`);
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
