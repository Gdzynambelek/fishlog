import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { listTripsForUser } from "@/lib/queries/trips";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { TripCard } from "@/components/cards/TripCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/layout/Fab";

export const metadata = { title: "Wyjazdy" };

export default async function TripsPage() {
  const trips = await listTripsForUser();

  return (
    <>
      <PageHeader
        title="Wyjazdy"
        description="Wszystkie Twoje wyjazdy wędkarskie."
        actions={
          <Button asChild className="hidden md:inline-flex">
            <Link href="/trips/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Nowy wyjazd
            </Link>
          </Button>
        }
      />

      {trips.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Brak wyjazdów"
          description="Zarejestruj swój pierwszy wyjazd, by zacząć śledzić ryby."
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

      <Fab href="/trips/new" label="Nowy wyjazd" />
    </>
  );
}
