import { redirect } from "next/navigation";

/**
 * Root path → dashboard. Middleware bounces unauthenticated users to /login
 * before this redirect runs.
 */
export default function Index(): never {
  redirect("/dashboard");
}
