import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CalendarDays, Plus } from "lucide-react";
import { listTripsForUser } from "@/lib/queries/trips";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { TripCard } from "@/components/cards/TripCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/layout/Fab";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("trips.title") };
}

export default async function TripsPage() {
  const t = await getTranslations();
  const trips = await listTripsForUser();

  return (
    <>
      <PageHeader
        title={t("trips.title")}
        description={t("trips.description")}
        actions={
          <Button asChild className="hidden md:inline-flex">
            <Link href="/trips/new">
              <Plus className="mr-1.5 h-4 w-4" />
              {t("trips.newTitle")}
            </Link>
          </Button>
        }
      />

      {trips.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={t("trips.emptyTitle")}
          description={t("trips.emptyDescription")}
          action={
            <Button asChild>
              <Link href="/trips/new">{t("trips.newTitle")}</Link>
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

      <Fab href="/trips/new" label={t("trips.newTitle")} />
    </>
  );
}
