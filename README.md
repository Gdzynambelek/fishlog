# 🎣 FishLog

Responsywny serwis WWW dla wędkarzy — dziennik wyjazdów i połowów. Aplikacja po polsku, kod po angielsku.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Postgres + Auth + Storage) · Leaflet + OpenStreetMap · Vercel.

---

## Funkcje

- 🔐 Logowanie e-mail/hasło + Google OAuth (Supabase Auth)
- 🗺️ Mapy łowisk z GPS (Leaflet) — działają mobile + desktop
- 📷 Zdjęcia połowów z aparatu/galerii, automatyczna kompresja przed uploadem
- 📊 Statystyki, filtry, wykres ranking gatunków (recharts)
- 📱 Responsywne breakpointy: mobile / tablet / desktop (sidebar vs bottom nav)
- 🛡️ Row Level Security w Supabase — każdy widzi tylko swoje dane

## Wymagania (development)

| Narzędzie    | Wersja      |
|--------------|-------------|
| Node.js      | ≥ 20 (LTS)  |
| npm          | ≥ 10        |
| Docker       | Desktop 4+  |
| Supabase CLI | ≥ 2.0       |

Sprawdź:
```bash
node -v && docker --version && supabase --version
```

## Quick start (lokalnie)

```bash
# 1. Zainstaluj zależności
npm install

# 2. Wystartuj lokalny stack Supabase (Postgres + Auth + Studio + Storage)
supabase start

# 3. Skopiuj URL i klucze do .env.local
supabase status
# Wpisz API URL → NEXT_PUBLIC_SUPABASE_URL
#       anon key → NEXT_PUBLIC_SUPABASE_ANON_KEY
#       service_role key → SUPABASE_SERVICE_ROLE_KEY

# 4. (Po zmianach w schemie) wygeneruj typy DB
npx supabase gen types typescript --local > src/types/database.types.ts

# 5. Odpal dev server
npm run dev
```

Aplikacja: http://localhost:3000  
Supabase Studio: http://127.0.0.1:54323  
Inbucket (testowe e-maile): http://127.0.0.1:54324

## Skrypty

```bash
npm run dev      # dev server (Next.js)
npm run build    # build produkcyjny
npm run start    # serwowanie buildu
npm run lint     # ESLint
```

## Struktura

```
src/
  app/
    login/                  ← strona logowania (publiczna)
    (app)/...               ← chronione widoki (dashboard, trips, catches, profile)
    auth/callback/          ← OAuth code-exchange
  components/
    ui/                     ← shadcn primitives
    layout/                 ← Shell, Sidebar, BottomNav, Fab, PageHeader
    cards/                  ← TripCard, CatchCard, StatCard
    forms/                  ← TripStepper, CatchForm, PhotoCapture, ...
    maps/                   ← LocationPicker, StaticMap, MapThumbnail
    catches/                ← Filters, Table, Grid, InfiniteCatches
    charts/                 ← SpeciesPieChart
  lib/
    queries/                ← Supabase queries (server + client)
    species.ts              ← stała lista gatunków PL
    stats.ts                ← agregacje (largest fish, ranking)
    storage.ts              ← upload zdjęć + kompresja
    geolocation.ts          ← navigator.geolocation wrapper
    validation.ts           ← schematy zod
    format.ts               ← formatowanie dat/wagi/długości
  utils/supabase/           ← klienci Supabase (client/server/middleware)
  types/database.types.ts   ← typy generowane z migracji
supabase/
  migrations/               ← schema SQL + RLS + Storage policies
  config.toml               ← konfiguracja CLI
```

## Deploy

Patrz [DEPLOY.md](./DEPLOY.md).

## Licencja

Brak licencji publicznej (projekt prywatny).
