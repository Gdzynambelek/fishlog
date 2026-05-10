import { CatchCard } from "@/components/cards/CatchCard";
import type { CatchWithTripName } from "@/lib/queries/catches";

/**
 * Card grid for catches. Used on mobile and tablet. Desktop has its own
 * `CatchesTable` (sortable columns) for denser display.
 */
export function CatchesGrid({ items }: { items: CatchWithTripName[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id}>
          <CatchCard item={item} />
        </li>
      ))}
    </ul>
  );
}
