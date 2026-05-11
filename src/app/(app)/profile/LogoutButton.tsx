"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    toast.success(t("auth.loggedOut"));
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={logout}>
      {children}
    </Button>
  );
}
