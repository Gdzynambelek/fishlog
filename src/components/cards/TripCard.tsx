import Link from "next/link";
import { CalendarDays, Fish, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { MapThumbnail } from "@/components/maps/MapThumbnail";
import type { TripWithCount } from "@/lib/queries/trips";

/** Card used in the trips grid + recent-trips sections. */
export function TripCard({ trip }: { trip: TripWithCount }) {
  return (
    <Link href={`/trips/${trip.id}`} className="group block">
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="relative h-32 w-full bg-muted">
          {trip.latitude !== null && trip.longitude !== null ? (
            <MapThumbnail
              latitude={trip.latitude}
              longitude={trip.longitude}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <MapPin className="h-8 w-8" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-1 text-base font-semibold">{trip.name}</h3>
          {trip.location_name ? (
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {trip.location_name}
            </p>
          ) : null}
          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {formatDate(trip.started_at)}
            </span>
            <Badge variant="secondary" className="gap-1">
              <Fish className="h-3 w-3" aria-hidden />
              {trip.catches_count}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
