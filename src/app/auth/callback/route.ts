import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * OAuth callback. Exchanges the `code` query param for a session cookie,
 * then redirects to the page the user originally tried to visit (or /dashboard).
 *
 * Used by Google OAuth flow. Configure this URL as a redirect URI in Supabase
 * Auth → URL Configuration: `<origin>/auth/callback`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback: bounce to login with an error flag.
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
