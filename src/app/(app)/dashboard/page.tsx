import Link from "next/link";
import {
  CalendarDays,
  Fish,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getUser } from "@/utils/supabase/server";
import { getStatsForUser } from "@/lib/stats";
import { recentTrips } from "@/lib/queries/trips";
import { recentCatches } from "@/lib/queries/catches";
import { formatWeight } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/cards/StatCard";
import { TripCard } from "@/components/cards/TripCard";
import { CatchCard } from "@/components/cards/CatchCard";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DashboardPage() {
  const [user, stats, trips, catches] = await Promise.all([
    getUser(),
    getStatsForUser(),
    recentTrips(3),
    recentCatches(3),
  ]);

  const greeting = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string).split(" ")[0]
    : user?.email?.split("@")[0] ?? "wędkarzu";

  return (
    <>
      <PageHeader
        title={`Cześć, ${greeting}! 👋`}
        description="Twój dziennik wędkarski w pigułce."
        actions={
          <Button asChild size="lg">
            <Link href="/trips/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Nowy wyjazd
            </Link>
          </Button>
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Połowy"
          value={stats.totalCatches}
          icon={Fish}
        />
        <StatCard
          label="Wyjazdy"
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

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Ostatnie wyjazdy
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/trips">Zobacz wszystkie</Link>
          </Button>
        </div>
        {trips.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Brak wyjazdów"
            description="Zacznij od dodania pierwszego wyjazdu wędkarskiego."
            action={
              <Button asChild>
                <Link href="/trips/new">Nowy wyjazd</Link>
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
            Ostatnie połowy
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/catches">Zobacz wszystkie</Link>
          </Button>
        </div>
        {catches.length === 0 ? (
          <EmptyState
            icon={Fish}
            title="Brak połowów"
            description="Dodaj wyjazd, a potem zarejestruj swoje pierwsze ryby."
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
