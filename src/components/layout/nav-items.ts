import { LayoutDashboard, Map, Fish, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Navigation entries shared by Sidebar and BottomNav. Labels are translation
 * keys (resolved via `useTranslations("nav")` at render time).
 */
export interface NavItem {
  href: string;
  /** key under the `nav` namespace in messages files */
  labelKey: "dashboard" | "trips" | "catches" | "profile";
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/trips", labelKey: "trips", icon: Map },
  { href: "/catches", labelKey: "catches", icon: Fish },
  { href: "/profile", labelKey: "profile", icon: User },
] as const;
