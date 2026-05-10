import { LayoutDashboard, Map, Fish, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Shared between sidebar (desktop) and bottom nav (mobile). */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/dashboard", label: "Pulpit", icon: LayoutDashboard },
  { href: "/trips", label: "Wyjazdy", icon: Map },
  { href: "/catches", label: "Połowy", icon: Fish },
  { href: "/profile", label: "Profil", icon: User },
] as const;
