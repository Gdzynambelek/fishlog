import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, isLocale } from "./config";

/**
 * Locale resolution: cookie first, then Accept-Language, then default.
 * Picked up by `createNextIntlPlugin` in `next.config.mjs`.
 */
export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  let locale = isLocale(fromCookie) ? fromCookie : null;

  if (!locale) {
    const accept = headers().get("accept-language") ?? "";
    for (const tag of accept.split(",")) {
      const code = tag.split(/[;-]/)[0]?.trim().toLowerCase();
      if (code && isLocale(code)) {
        locale = code;
        break;
      }
    }
  }

  if (!locale) locale = DEFAULT_LOCALE;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: "Europe/Warsaw",
  };
});

export { LOCALES, DEFAULT_LOCALE };
