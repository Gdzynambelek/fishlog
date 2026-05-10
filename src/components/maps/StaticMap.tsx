"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Read-only wrapper around the same inner Leaflet component.
const Inner = dynamic(() => import("./LocationPickerInner"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-xl md:h-80" />,
});

/** Read-only map showing a single marker. Used on trip detail page. */
export function StaticMap({
  latitude,
  longitude,
  className,
}: {
  latitude: number;
  longitude: number;
  className?: string;
}) {
  return (
    <Inner
      value={{ latitude, longitude }}
      onChange={() => {}}
      readOnly
      className={
        className ??
        "h-64 w-full overflow-hidden rounded-xl border border-border md:h-80"
      }
    />
  );
}
