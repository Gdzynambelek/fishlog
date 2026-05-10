import { CalendarDays, Fish, LogOut, Sparkles, Trophy } from "lucide-react";
import { getUser } from "@/utils/supabase/server";
import { getStatsForUser, getSpeciesRanking } from "@/lib/stats";
import { formatWeight } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/cards/StatCard";
import { SpeciesPieChart } from "@/components/charts/SpeciesPieChart";
import { LogoutButton } from "./LogoutButton";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const [user, stats, ranking] = await Promise.all([
    getUser(),
    getStatsForUser(),
    getSpeciesRanking(),
  ]);

  if (!user) return null; // layout already handles auth gate

  const meta = user.user_metadata ?? {};
  const name =
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Wędkarz";
  const avatarUrl =
    (meta.avatar_url as string | undefined) ??
    (meta.picture as string | undefined) ??
    null;
  const initials = name
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
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
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

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Więcej opcji (ustawienia, znajomi) wkrótce.
      </p>
    </>
  );
}
