import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names — handles conflicts (e.g. "px-2 px-4" → "px-4")
 * and conditional classes via clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
