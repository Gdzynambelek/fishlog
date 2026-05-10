/**
 * Promise wrapper around `navigator.geolocation.getCurrentPosition` with
 * Polish error messages and sensible defaults.
 *
 * Browser quirks:
 *  - iOS Safari requires HTTPS for geolocation (Vercel provides this).
 *  - `enableHighAccuracy: true` is necessary for good fishing-spot precision
 *    but uses GPS hardware; fall back gracefully if it times out.
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

export function getCurrentPosition(): Promise<Coordinates> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return Promise.reject(
      new GeolocationError(
        -1,
        "Twoja przeglądarka nie obsługuje geolokalizacji.",
      ),
    );
  }

  return new Promise<Coordinates>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(translateError(err)),
      { enableHighAccuracy: true, timeout: TIMEOUT_MS, maximumAge: 30_000 },
    );
  });
}

function translateError(err: GeolocationPositionError): GeolocationError {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return new GeolocationError(
        err.code,
        "Brak zgody na dostęp do lokalizacji. Włącz dostęp w ustawieniach przeglądarki.",
      );
    case err.POSITION_UNAVAILABLE:
      return new GeolocationError(
        err.code,
        "Nie udało się ustalić Twojej lokalizacji. Spróbuj ponownie lub kliknij na mapie.",
      );
    case err.TIMEOUT:
      return new GeolocationError(
        err.code,
        "Przekroczono limit czasu pobierania lokalizacji.",
      );
    default:
      return new GeolocationError(err.code, "Nieznany błąd geolokalizacji.");
  }
}
