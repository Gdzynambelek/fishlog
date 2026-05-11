/**
 * Supported locales. PL is the default for unknown / first-time visitors.
 * Adding a new locale: drop a file in `messages/<code>.json` + extend this
 * array. No need to touch routing — locale lives in a cookie, not the URL.
 */
export const LOCALES = ["pl", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pl";

/** Cookie name that stores the user-selected locale. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}
