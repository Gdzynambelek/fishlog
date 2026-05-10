import { format, formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

/** Formats a date as "12 maja 2025" in Polish. */
export function formatDate(d: string | Date): string {
  return format(typeof d === "string" ? new Date(d) : d, "d MMMM yyyy", {
    locale: pl,
  });
}

/** Formats a date+time as "12 maja 2025, 14:30". */
export function formatDateTime(d: string | Date): string {
  return format(typeof d === "string" ? new Date(d) : d, "d MMMM yyyy, HH:mm", {
    locale: pl,
  });
}

/** Returns "2 dni temu" / "5 minut temu" etc. */
export function formatRelative(d: string | Date): string {
  return formatDistanceToNow(typeof d === "string" ? new Date(d) : d, {
    locale: pl,
    addSuffix: true,
  });
}

/** Returns "1.2 kg" / "—" for null. */
export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return "—";
  return `${kg.toFixed(2).replace(/\.?0+$/, "")} kg`;
}

/** Returns "42 cm" / "—" for null. */
export function formatLength(cm: number | null | undefined): string {
  if (cm == null) return "—";
  return `${cm.toFixed(1).replace(/\.0$/, "")} cm`;
}

/**
 * Formats a JS Date in the local timezone as the value expected by
 * `<input type="datetime-local">` (yyyy-MM-ddTHH:mm). The browser's
 * datetime-local rejects timezone-aware ISO strings.
 */
export function toDatetimeLocalValue(d: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/** Convert datetime-local string to ISO string for Supabase. */
export function fromDatetimeLocalValue(s: string): string {
  return new Date(s).toISOString();
}
