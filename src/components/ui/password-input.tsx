"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Password input with show/hide toggle. Drop-in replacement for `<Input
 * type="password" />`. The toggle button is a sibling overlay so the input
 * keeps native autofill + form behavior; we just flip `type` between
 * `password` and `text` on click.
 *
 * The toggle has its own tabIndex=-1 so keyboard tab order stays
 * email → password → submit, with the eye icon reachable only via mouse.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function PasswordInput({ className, ...props }, ref) {
  const t = useTranslations();
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={
          visible ? t("auth.hidePassword") : t("auth.showPassword")
        }
        aria-pressed={visible}
        // Fully opaque dark pill so the eye is readable on any input bg
        // (dark login, translucent input area, browser autofill highlight).
        // (Earlier `bg-[hsl(...)]/80` didn't parse the alpha modifier on the
        // arbitrary HSL value in Tailwind v3 → default state had no bg →
        // icon was invisible on the light input area.)
        className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(168,38%,12%)] text-white shadow transition-colors hover:bg-[hsl(168,38%,6%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
});
