"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Wylogowano. Do zobaczenia!");
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={logout}>
      {children}
    </Button>
  );
}
