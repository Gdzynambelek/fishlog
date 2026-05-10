import { MapPin } from "lucide-react";

const TILE_SIZE = 256;
const ZOOM = 13;

/**
 * Static "map thumbnail" using a single OSM tile. Cheap (one image, no JS),
 * good enough for trip cards. The marker is overlaid via SVG at the center.
 *
 * Note: OSM Foundation's tile servers ask that tiles aren't used for heavy
 * production traffic without their consent. For higher-traffic apps, swap
 * the URL with a tile provider that allows commercial use (or self-host).
 */
export function MapThumbnail({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const { x, y } = lonLatToTile(longitude, latitude, ZOOM);
  const url = `https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element -- raw OSM tile, no Next/Image config needed */}
      <img
        src={url}
        alt="Mapa łowiska"
        loading="lazy"
        decoding="async"
        width={TILE_SIZE}
        height={TILE_SIZE}
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <MapPin
          className="h-7 w-7 fill-primary text-primary-foreground drop-shadow"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
}

function lonLatToTile(lon: number, lat: number, zoom: number) {
  const n = 2 ** zoom;
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n,
  );
  return { x, y };
}
