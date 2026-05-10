import {
  CalendarDays,
  Fish,
  IdCard,
  LogOut,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getUser } from "@/utils/supabase/server";
import { getStatsForUser, getSpeciesRanking } from "@/lib/stats";
import { getMyProfile, resolveDisplayName } from "@/lib/queries/profile";
import { formatWeight } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/cards/StatCard";
import { SpeciesPieChart } from "@/components/charts/SpeciesPieChart";
import { LogoutButton } from "./LogoutButton";
import { PermitLinksList, ProfileForm } from "./ProfileForm";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const [user, profile, stats, ranking] = await Promise.all([
    getUser(),
    getMyProfile(),
    getStatsForUser(),
    getSpeciesRanking(),
  ]);
  if (!user) return null;

  const displayName = resolveDisplayName(profile, user);
  const meta = user.user_metadata ?? {};
  const avatarUrl =
    (meta["avatar_url"] as string | undefined) ??
    (meta["picture"] as string | undefined) ??
    null;
  const initials =
    displayName
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <>
      <PageHeader title="Profil" />

      <Card className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:gap-6">
        <Avatar className="h-20 w-20">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
          <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-semibold">{displayName}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {profile?.fishing_license ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <IdCard className="h-3.5 w-3.5" aria-hidden />
              Karta wędkarska: {profile.fishing_license}
            </p>
          ) : null}
        </div>
        <LogoutButton>
          <LogOut className="mr-1.5 h-4 w-4" />
          Wyloguj się
        </LogoutButton>
      </Card>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Wszystkich połowów"
          value={stats.totalCatches}
          icon={Fish}
        />
        <StatCard
          label="Wyjazdów"
          value={stats.totalTrips}
          icon={CalendarDays}
        />
        <StatCard
          label="Największa ryba"
          value={
            stats.largestFish
              ? formatWeight(stats.largestFish.weight_kg)
              : "—"
          }
          hint={stats.largestFish?.species}
          icon={Trophy}
        />
        <StatCard
          label="Ulubiony gatunek"
          value={stats.favoriteSpecies ?? "—"}
          icon={Sparkles}
        />
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Dane profilu</h2>
        {profile ? <ProfileForm profile={profile} /> : null}
      </section>

      {profile && profile.permit_links.length > 0 ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Twoje linki do pozwoleń
          </h2>
          <Card className="p-5">
            <PermitLinksList links={profile.permit_links} />
          </Card>
        </section>
      ) : null}

      {ranking.length > 0 ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Ranking gatunków
          </h2>
          <Card className="p-4 sm:p-6">
            <SpeciesPieChart items={ranking} />
          </Card>
        </section>
      ) : null}
    </>
  );
}
