import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Cloud,
  Edit,
  MapPin,
  Plus,
  StickyNote,
} from "lucide-react";
import { getTripById, getCatchesForTrip } from "@/lib/queries/trips";
import {
  listAttachmentsForTrip,
  signedUrlForAttachment,
} from "@/lib/queries/attachments";
import { computeTripStats } from "@/lib/stats";
import { formatDateTime, formatWeight } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/cards/StatCard";
import { EmptyState } from "@/components/ui/empty-state";
import { StaticMap } from "@/components/maps/StaticMap";
import { TripCatchItem } from "@/components/catches/TripCatchItem";
import { TripAttachments } from "@/components/attachments/TripAttachments";
import { DeleteTripButton } from "./DeleteTripButton";

export default async function TripDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const trip = await getTripById(params.id);
  if (!trip) notFound();

  const [catches, rawAttachments] = await Promise.all([
    getCatchesForTrip(trip.id),
    listAttachmentsForTrip(trip.id),
  ]);

  // Sign each attachment URL server-side so the client never sees the raw
  // storage path. Done in parallel — N is small (a handful of PDFs per trip).
  const attachments = await Promise.all(
    rawAttachments.map(async (a) => ({
      ...a,
      signedUrl: await signedUrlForAttachment(a.file_path),
    })),
  );

  const stats = computeTripStats(catches);

  return (
    <>
      <PageHeader
        title={trip.name}
        description={
          trip.location_name
            ? `${trip.location_name} · ${formatDateTime(trip.started_at)}`
            : formatDateTime(trip.started_at)
        }
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="Edytuj wyjazd">
              <Link href={`/trips/${trip.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <DeleteTripButton tripId={trip.id} tripName={trip.name} />
            <Button asChild>
              <Link href={`/trips/${trip.id}/catch/new`}>
                <Plus className="mr-1.5 h-4 w-4" />
                Dodaj połów
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {trip.latitude !== null && trip.longitude !== null ? (
            <StaticMap latitude={trip.latitude} longitude={trip.longitude} />
          ) : (
            <Card className="flex h-64 items-center justify-center text-muted-foreground">
              Brak współrzędnych łowiska
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <Card className="space-y-3 p-5 text-sm">
            <Row icon={CalendarDays} label="Rozpoczęcie">
              {formatDateTime(trip.started_at)}
            </Row>
            {trip.ended_at ? (
              <Row icon={CalendarDays} label="Zakończenie">
                {formatDateTime(trip.ended_at)}
              </Row>
            ) : null}
            {trip.location_name ? (
              <Row icon={MapPin} label="Miejsce">
                {trip.location_name}
              </Row>
            ) : null}
            {trip.weather ? (
              <Row icon={Cloud} label="Pogoda">
                {trip.weather}
              </Row>
            ) : null}
            {trip.notes ? (
              <Row icon={StickyNote} label="Notatki">
                <p className="whitespace-pre-wrap">{trip.notes}</p>
              </Row>
            ) : null}
          </Card>
        </div>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Połowy" value={stats.totalCatches} />
        <StatCard
          label="Łączna waga"
          value={formatWeight(stats.totalWeightKg || null)}
        />
        <StatCard
          label="Największa"
          value={
            stats.largestFish
              ? formatWeight(stats.largestFish.weight_kg)
              : "—"
          }
          hint={stats.largestFish?.species}
        />
      </section>

      <section className="mt-8">
        <TripAttachments tripId={trip.id} initial={attachments} />
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Połowy</h2>
        {catches.length === 0 ? (
          <EmptyState
            title="Brak połowów na tym wyjeździe"
            description="Złowiłeś coś? Dodaj swój pierwszy połów."
            action={
              <Button asChild>
                <Link href={`/trips/${trip.id}/catch/new`}>Dodaj połów</Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catches.map((c) => (
              <li key={c.id}>
                <TripCatchItem item={c} tripId={trip.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}
