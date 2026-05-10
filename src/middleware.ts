import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Run on every request EXCEPT static assets and Next internals. We still
 * want to run on /login and /auth so the helper keeps cookies in sync —
 * the route guard inside `updateSession` makes the auth decision.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
