import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Fish } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatLength, formatWeight } from "@/lib/format";
import type { CatchWithTripName } from "@/lib/queries/catches";

export function CatchCard({ item }: { item: CatchWithTripName }) {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <Link
      href={`/trips/${item.trip_id}`}
      className="group block focus-visible:outline-none"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative aspect-video w-full bg-muted">
          {item.photo_url ? (
            <Image
              src={item.photo_url}
              alt={item.species}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/70">
              <Fish className="h-10 w-10" aria-hidden />
            </div>
          )}
          {item.released ? (
            <Badge
              variant="secondary"
              className="absolute right-2 top-2 bg-background/90 backdrop-blur"
            >
              {t("catches.released")}
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-base font-semibold">{item.species}</h3>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {formatWeight(item.weight_kg)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatLength(item.length_cm)}</span>
            <time dateTime={item.caught_at}>
              {formatDateTime(item.caught_at, locale)}
            </time>
          </div>
          {item.trip_name ? (
            <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
              {t("catches.tripLabel", { name: item.trip_name })}
            </p>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
