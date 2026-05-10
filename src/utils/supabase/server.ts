import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Server-side Supabase client for App Router server components / route
 * handlers / server actions. Cookies are read via Next's `cookies()` helper.
 *
 * NOTE: server components are read-only with respect to cookies — `setAll`
 * may throw "Cookies can only be modified in a Server Action or Route Handler".
 * We swallow that case; the middleware refreshes sessions on every request,
 * so a missed write here is harmless (the cookie will be re-set on the next
 * request that goes through middleware).
 */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server component context — ignore. Middleware will refresh.
          }
        },
      },
    },
  );
}

/**
 * Convenience: get current user from server context. Returns null if not
 * authenticated. Use in server components that need the user object.
 */
export async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
