# DEPLOY.md — wdrożenie FishLog

Krok po kroku: Supabase Cloud + Vercel + Google OAuth.

---

## 1. Założenie projektu Supabase

1. Wejdź na https://supabase.com → **New project**.
2. Wybierz organizację, podaj nazwę (np. `fishlog`), region najbliższy użytkownikom (`eu-central-1` / Frankfurt).
3. Wygeneruj silne hasło DB (zapisz w menedżerze haseł).
4. Po utworzeniu projektu skopiuj z **Settings → API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon (public)** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role (secret)** → `SUPABASE_SERVICE_ROLE_KEY` (tylko server-side!)

## 2. Wgranie schematu (migracja + RLS + Storage bucket)

W katalogu projektu lokalnie:

```bash
# Zaloguj CLI (przez przeglądarkę)
supabase login

# Skojarz lokalne migracje z Cloud projektem
supabase link --project-ref <YOUR_PROJECT_REF>
# (REF znajdziesz w Settings → General → Reference ID)

# Wypchnij migracje
supabase db push
```

Migracja `0001_init.sql` utworzy:
- tabele `trips`, `catches`,
- indeksy + RLS + polityki właściciela,
- bucket Storage `catches-photos` z politykami publicznego odczytu i zapisu we własnym folderze.

> **Sanity check:** wejdź w Supabase Studio → **Table Editor** — powinny być widoczne tabele `trips` i `catches`. W **Storage** → bucket `catches-photos`.

## 3. Konfiguracja Google OAuth

1. **Google Cloud Console** → nowy projekt (lub istniejący):
   - **APIs & Services → OAuth consent screen** → wybierz **External** → wypełnij minimalnie nazwę aplikacji + e-mail wsparcia → opublikuj.
   - **APIs & Services → Credentials → Create credentials → OAuth client ID** → typ **Web application**.
   - **Authorized redirect URIs**:
     ```
     https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
     ```
   - Skopiuj **Client ID** i **Client Secret**.

2. **Supabase Studio → Authentication → Providers → Google**:
   - Włącz, wklej **Client ID** i **Client Secret** → Save.

3. **Authentication → URL Configuration**:
   - **Site URL**: `https://<your-vercel-domain>` (po deployu na Vercel).
   - **Redirect URLs** (dodaj wszystkie):
     ```
     http://localhost:3000/auth/callback
     https://<your-vercel-domain>/auth/callback
     ```

## 4. Deploy na Vercel

1. Wejdź na https://vercel.com → **Add New… → Project** → import z GitHub (`fishlog` repo).
2. Framework Preset: **Next.js** (auto-wykryte).
3. **Environment Variables** — wszystkie środowiska (Production + Preview):

   | Klucz | Wartość |
   |-------|---------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon) |
   | `SUPABASE_SERVICE_ROLE_KEY` | (service_role) |

4. **Deploy**.
5. Po pierwszym deployu skopiuj URL Vercela i wróć do Supabase **Authentication → URL Configuration**: dodaj URL Vercela jako Site URL i jako redirect URL.

## 5. Storage bucket (jeśli nie z migracji)

Migracja tworzy bucket automatycznie. Jeśli z jakiegoś powodu trzeba ręcznie:
- Supabase Studio → **Storage → New bucket** → nazwa `catches-photos`, **Public** ✅.
- Polityki tworzy migracja (`catches_photos_public_read`, `catches_photos_owner_*`).

## 6. Testowanie po deployu

Z telefonu wejdź na URL Vercela, **przez HTTPS** (Vercel zapewnia automatycznie):
1. Zaloguj się przez Google.
2. Dodaj wyjazd → klikni **Użyj mojej lokalizacji** (przeglądarka zapyta o zgodę na GPS — zezwól).
3. Dodaj połów → kliknij **Zrób zdjęcie** — na iOS/Android otworzy się tylna kamera (`capture="environment"`).
4. Sprawdź w Supabase Studio → **Table Editor → catches** czy rekord jest. **Storage → catches-photos** — czy zdjęcie jest pod ścieżką `<user_id>/<trip_id>/<uuid>.jpg`.

## 7. Znane ograniczenia

- **Sieroce zdjęcia.** Usunięcie wyjazdu kasuje rekord `catches` (cascade), ale pliki w Storage zostają. Można dorobić cron / trigger usuwający — poza MVP.
- **OSM tile usage.** Map miniatury i mapa Leaflet używają darmowych kafelków OpenStreetMap. Dla dużego ruchu rozważ przełączenie na Mapbox/MapTiler (płatne, ale generous free tier).
- **Brak edycji wyjazdu.** Można usunąć i utworzyć ponownie. Pełna edycja zaplanowana w kolejnej iteracji.

## 8. Aktualizacje schematu

Po zmianach w `supabase/migrations/`:

```bash
supabase db push                                                      # wgranie do Cloud
npx supabase gen types typescript --linked > src/types/database.types.ts
git add supabase/migrations src/types/database.types.ts
git commit -m "db: ..."
git push                                                              # → Vercel auto-deploy
```
