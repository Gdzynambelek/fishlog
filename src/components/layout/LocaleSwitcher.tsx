"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Check } from "lucide-react";
import { setLocaleAction } from "@/i18n/actions";
import { LOCALES, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Language picker — writes locale into a cookie via server action and
 * triggers a re-render. Compact (icon-only) by default, with a labeled
 * variant for the profile page.
 */
export function LocaleSwitcher({
  variant = "icon",
}: {
  variant?: "icon" | "labeled";
}) {
  const t = useTranslations("locale");
  const current = useLocale() as Locale;
  const [pending, startTransition] = useTransition();

  function pick(loc: Locale) {
    if (loc === current) return;
    startTransition(() => {
      setLocaleAction(loc);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "labeled" ? "outline" : "ghost"}
          size={variant === "labeled" ? "default" : "icon"}
          aria-label={t("switchLanguage")}
          disabled={pending}
        >
          <Globe className="h-4 w-4" />
          {variant === "labeled" ? (
            <span className="ml-2">{t(current)}</span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onSelect={() => pick(loc)}
            className="cursor-pointer"
          >
            <Check
              className={`mr-2 h-4 w-4 ${
                loc === current ? "opacity-100" : "opacity-0"
              }`}
            />
            {t(loc)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
