"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon paths under Next.js bundlers (the relative
// img URLs Leaflet ships with don't resolve via webpack). Using a CDN is
// simplest and avoids dragging icon assets into /public.
const ICON_BASE = "https://unpkg.com/leaflet@1.9.4/dist/images";
L.Icon.Default.mergeOptions({
  iconUrl: `${ICON_BASE}/marker-icon.png`,
  iconRetinaUrl: `${ICON_BASE}/marker-icon-2x.png`,
  shadowUrl: `${ICON_BASE}/marker-shadow.png`,
});

const POLAND_CENTER: [number, number] = [52.0693, 19.4803];
const DEFAULT_ZOOM = 6;
const PICKED_ZOOM = 13;

export interface LocationPickerInnerProps {
  value: { latitude: number; longitude: number } | null;
  onChange: (next: { latitude: number; longitude: number }) => void;
  readOnly?: boolean;
  className?: string;
}

export default function LocationPickerInner({
  value,
  onChange,
  readOnly = false,
  className,
}: LocationPickerInnerProps) {
  const center: [number, number] = useMemo(
    () => (value ? [value.latitude, value.longitude] : POLAND_CENTER),
    [value],
  );
  const zoom = value ? PICKED_ZOOM : DEFAULT_ZOOM;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className={
        className ??
        "h-64 w-full overflow-hidden rounded-xl border border-border md:h-80"
      }
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {value ? (
        <Marker position={[value.latitude, value.longitude]} />
      ) : null}
      {!readOnly ? <ClickHandler onChange={onChange} /> : null}
      <RecenterOnChange value={value} />
    </MapContainer>
  );
}

function ClickHandler({
  onChange,
}: {
  onChange: (next: { latitude: number; longitude: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onChange({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

function RecenterOnChange({
  value,
}: {
  value: { latitude: number; longitude: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (value) map.flyTo([value.latitude, value.longitude], PICKED_ZOOM);
  }, [map, value]);
  return null;
}
