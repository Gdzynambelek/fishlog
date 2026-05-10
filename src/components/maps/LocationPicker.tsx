"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GeolocationError,
  getCurrentPosition,
} from "@/lib/geolocation";

// Leaflet must NOT run on the server: it touches `window` at import time.
const Inner = dynamic(() => import("./LocationPickerInner"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-64 w-full rounded-xl md:h-80" />
  ),
});

export interface LocationPickerProps {
  value: { latitude: number; longitude: number } | null;
  onChange: (next: { latitude: number; longitude: number }) => void;
  description?: string;
}

/**
 * Composite location picker: a "use my location" button + an interactive
 * Leaflet map. Click the map to drop a marker, or press the button to
 * use HTML5 geolocation.
 */
export function LocationPicker({
  value,
  onChange,
  description = "Kliknij na mapie lub użyj GPS, by wskazać miejsce.",
}: LocationPickerProps) {
  const [locating, setLocating] = useState(false);

  async function useGps() {
    setLocating(true);
    try {
      const coords = await getCurrentPosition();
      onChange(coords);
      toast.success("Pobrano lokalizację z GPS.");
    } catch (err) {
      const msg =
        err instanceof GeolocationError
          ? err.message
          : "Nie udało się pobrać lokalizacji.";
      toast.error(msg);
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{description}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={useGps}
          disabled={locating}
        >
          {locating ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="mr-1.5 h-4 w-4" />
          )}
          Użyj mojej lokalizacji
        </Button>
      </div>
      <Inner value={value} onChange={onChange} />
      {value ? (
        <p className="text-xs text-muted-foreground tabular-nums">
          {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
        </p>
      ) : null}
    </div>
  );
}
