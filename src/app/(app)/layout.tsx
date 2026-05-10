import { redirect } from "next/navigation";
import { getUser } from "@/utils/supabase/server";
import { Shell } from "@/components/layout/Shell";

/**
 * Layout for all authenticated pages. The middleware already redirects
 * unauthenticated users to /login, but we double-check here so server
 * components below can rely on `user` being present (race-condition safe
 * after the cookie refresh).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  return <Shell user={user}>{children}</Shell>;
}
