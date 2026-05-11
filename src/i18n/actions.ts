"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, LOCALE_COOKIE } from "./config";

/**
 * Server action: persist user's locale choice in a long-lived cookie and
 * invalidate caches so the rest of the app re-renders with new translations.
 */
export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return;
  cookies().set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
