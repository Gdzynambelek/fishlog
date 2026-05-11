import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  CalendarDays,
  Fish,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getUser } from "@/utils/supabase/server";
import { getMyProfile, resolveGreetingName } from "@/lib/queries/profile";
import { getStatsForUser, getTopFish } from "@/lib/stats";
import { recentTrips } from "@/lib/queries/trips";
import { recentCatches } from "@/lib/queries/catches";
import { formatWeight } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/cards/StatCard";
import { TripCard } from "@/components/cards/TripCard";
import { CatchCard } from "@/components/cards/CatchCard";
import { TopFishCard } from "@/components/cards/TopFishCard";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DashboardPage() {
  const t = await getTranslations();
  const [user, profile, stats, topFish, trips, catches] = await Promise.all([
    getUser(),
    getMyProfile(),
    getStatsForUser(),
    getTopFish(3),
    recentTrips(3),
    recentCatches(3),
  ]);

  const greeting = resolveGreetingName(
    profile,
    user ?? {},
    t("dashboard.greetingFallback"),
  );

  return (
    <>
      <PageHeader
        title={t("dashboard.greeting", { name: greeting })}
        description={t("dashboard.description")}
        actions={
          <Button asChild size="lg">
            <Link href="/trips/new">
              <Plus className="mr-1.5 h-4 w-4" />
              {t("dashboard.newTrip")}
            </Link>
          </Button>
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label={t("dashboard.totalCatches")}
          value={stats.totalCatches}
          icon={Fish}
        />
        <StatCard
          label={t("dashboard.totalTrips")}
          value={stats.totalTrips}
          icon={CalendarDays}
        />
        <StatCard
          label={t("dashboard.largestFish")}
          value={
            stats.largestFish
              ? formatWeight(stats.largestFish.weight_kg)
              : "—"
          }
          hint={stats.largestFish?.species}
          icon={Trophy}
        />
        <StatCard
          label={t("dashboard.favoriteSpecies")}
          value={stats.favoriteSpecies ?? "—"}
          icon={Sparkles}
        />
      </section>

      {topFish.length > 0 ? (
        <section className="mt-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              {t("dashboard.topFish", { count: topFish.length })}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {topFish.map((fish, idx) => (
              <TopFishCard key={fish.id} item={fish} rank={idx + 1} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            {t("dashboard.recentTrips")}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/trips">{t("dashboard.viewAll")}</Link>
          </Button>
        </div>
        {trips.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={t("dashboard.emptyTripsTitle")}
            description={t("dashboard.emptyTripsDescription")}
            action={
              <Button asChild>
                <Link href="/trips/new">{t("dashboard.newTrip")}</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            {t("dashboard.recentCatches")}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/catches">{t("dashboard.viewAll")}</Link>
          </Button>
        </div>
        {catches.length === 0 ? (
          <EmptyState
            icon={Fish}
            title={t("dashboard.emptyCatchesTitle")}
            description={t("dashboard.emptyCatchesDescription")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catches.map((c) => (
              <CatchCard key={c.id} item={c} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
