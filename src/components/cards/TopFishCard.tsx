import Image from "next/image";
import Link from "next/link";
import { Fish, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate, formatWeight } from "@/lib/format";
import type { TopFishItem } from "@/lib/stats";
import { cn } from "@/lib/utils";

const RANK_BG = [
  "bg-[hsl(41_73%_66%)] text-[hsl(168_38%_12%)]", // gold
  "bg-[hsl(0_0%_75%)] text-[hsl(168_38%_12%)]", // silver
  "bg-[hsl(28_45%_55%)] text-white", // bronze
];

/**
 * Top-fish card with rank badge (gold/silver/bronze for #1–#3).
 * Used in dashboard "Top 3 największe ryby" section.
 */
export function TopFishCard({
  item,
  rank,
}: {
  item: TopFishItem;
  rank: number;
}) {
  const rankClass =
    RANK_BG[rank - 1] ?? "bg-muted text-muted-foreground";

  return (
    <Link href={`/trips/${item.trip_id}`} className="group block">
      <Card className="flex h-full overflow-hidden rounded-2xl border-border/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="relative h-24 w-24 shrink-0 bg-muted">
          {item.photo_url ? (
            <Image
              src={item.photo_url}
              alt={item.species}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Fish className="h-8 w-8" aria-hidden />
            </div>
          )}
          <span
            className={cn(
              "absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow",
              rankClass,
            )}
            aria-label={`Miejsce ${rank}`}
          >
            {rank === 1 ? <Trophy className="h-3 w-3" /> : rank}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-0.5 p-3">
          <p className="truncate text-sm font-semibold">{item.species}</p>
          <p className="text-lg font-bold tabular-nums text-primary">
            {formatWeight(item.weight_kg)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(item.caught_at)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
