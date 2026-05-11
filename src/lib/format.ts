import { format, formatDistanceToNow, type Locale } from "date-fns";
import { pl, enUS, de } from "date-fns/locale";

const LOCALE_MAP: Record<string, Locale> = {
  pl,
  en: enUS,
  de,
};

function pickLocale(code: string | undefined): Locale {
  if (code && LOCALE_MAP[code]) return LOCALE_MAP[code] as Locale;
  return pl;
}

/** "12 May 2025" / "12 maja 2025" / "12. Mai 2025" depending on locale. */
export function formatDate(
  d: string | Date,
  localeCode = "pl",
): string {
  return format(typeof d === "string" ? new Date(d) : d, "d MMMM yyyy", {
    locale: pickLocale(localeCode),
  });
}

export function formatDateTime(
  d: string | Date,
  localeCode = "pl",
): string {
  return format(
    typeof d === "string" ? new Date(d) : d,
    "d MMMM yyyy, HH:mm",
    { locale: pickLocale(localeCode) },
  );
}

export function formatRelative(
  d: string | Date,
  localeCode = "pl",
): string {
  return formatDistanceToNow(typeof d === "string" ? new Date(d) : d, {
    locale: pickLocale(localeCode),
    addSuffix: true,
  });
}

/** Returns "1.2 kg" / "—" for null. Unit is locale-independent. */
export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return "—";
  return `${kg.toFixed(2).replace(/\.?0+$/, "")} kg`;
}

export function formatLength(cm: number | null | undefined): string {
  if (cm == null) return "—";
  return `${cm.toFixed(1).replace(/\.0$/, "")} cm`;
}

export function toDatetimeLocalValue(d: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function fromDatetimeLocalValue(s: string): string {
  return new Date(s).toISOString();
}
