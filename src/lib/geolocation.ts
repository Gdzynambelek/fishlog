/**
 * Promise wrapper around `navigator.geolocation.getCurrentPosition` with
 * localized error messages. Caller passes a `t` translator (typically from
 * `useTranslations()`) — keeps this lib UI-framework agnostic but i18n-aware.
 *
 * Browser quirks:
 *  - iOS Safari requires HTTPS for geolocation (Vercel provides this).
 *  - `enableHighAccuracy: true` is necessary for fishing-spot precision but
 *    uses GPS hardware; fall back gracefully if it times out.
 */

export type Coordinates = { latitude: number; longitude: number };

export class GeolocationError extends Error {
  readonly code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = "GeolocationError";
  }
}

const TIMEOUT_MS = 10_000;

type Translator = (key: string) => string;

export function getCurrentPosition(t?: Translator): Promise<Coordinates> {
  const tr = t ?? ((k: string) => k);

  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return Promise.reject(
      new GeolocationError(-1, tr("map.gpsUnsupported")),
    );
  }

  return new Promise<Coordinates>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(translateError(err, tr)),
      { enableHighAccuracy: true, timeout: TIMEOUT_MS, maximumAge: 30_000 },
    );
  });
}

function translateError(
  err: GeolocationPositionError,
  t: Translator,
): GeolocationError {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return new GeolocationError(err.code, t("map.gpsDenied"));
    case err.POSITION_UNAVAILABLE:
      return new GeolocationError(err.code, t("map.gpsUnavailable"));
    case err.TIMEOUT:
      return new GeolocationError(err.code, t("map.gpsTimeout"));
    default:
      return new GeolocationError(err.code, t("map.gpsError"));
  }
}
