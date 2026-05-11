"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GeolocationError,
  getCurrentPosition,
} from "@/lib/geolocation";

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

export function LocationPicker({
  value,
  onChange,
  description,
}: LocationPickerProps) {
  const t = useTranslations();
  const [locating, setLocating] = useState(false);

  async function useGps() {
    setLocating(true);
    try {
      const coords = await getCurrentPosition(t);
      onChange(coords);
      toast.success(t("map.gotFromGps"));
    } catch (err) {
      const msg =
        err instanceof GeolocationError ? err.message : t("map.gpsError");
      toast.error(msg);
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {description ?? t("map.hint")}
        </p>
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
          {t("map.useMyLocation")}
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
