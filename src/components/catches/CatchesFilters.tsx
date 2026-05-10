"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { POPULAR_SPECIES_PL } from "@/lib/species";

/**
 * Catch list filters. Stored in URL params so the server-rendered list
 * stays in sync with what the user picked. On mobile the controls live
 * inside a Sheet (collapsible); on desktop they're inline.
 */
export function CatchesFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initial = readState(params);
  const [draft, setDraft] = useState(initial);

  function applyImmediate(updates: Partial<FilterState>) {
    const merged = { ...draft, ...updates };
    setDraft(merged);
    pushTo(router, params, merged, startTransition);
  }

  function applyAndClose() {
    pushTo(router, params, draft, startTransition);
  }

  function reset() {
    setDraft(emptyState());
    pushTo(router, params, emptyState(), startTransition);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Mobile: open in sheet. */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            disabled={isPending}
          >
            <Filter className="mr-1.5 h-4 w-4" />
            Filtry
            {countActive(initial) > 0 ? (
              <Badge variant="secondary" className="ml-2">
                {countActive(initial)}
              </Badge>
            ) : null}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtry</SheetTitle>
            <SheetDescription>Zawęź listę połowów.</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 py-4">
            <SpeciesPicker draft={draft} setDraft={setDraft} />
            <DateRangeInputs draft={draft} setDraft={setDraft} />
            <MinWeightInput draft={draft} setDraft={setDraft} />
            <PhotoOnlyToggle draft={draft} setDraft={setDraft} />
          </div>
          <SheetFooter className="gap-2">
            <Button variant="ghost" onClick={reset}>
              Wyczyść
            </Button>
            <SheetClose asChild>
              <Button onClick={applyAndClose}>Zastosuj</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Desktop: inline controls. */}
      <div className="hidden flex-wrap items-end gap-3 md:flex">
        <SpeciesPicker
          draft={draft}
          setDraft={(s) =>
            applyImmediate({ species: typeof s === "function" ? s(draft).species : s.species })
          }
          variant="inline"
        />
        <DateRangeInputs
          draft={draft}
          setDraft={(s) => {
            const next = typeof s === "function" ? s(draft) : s;
            applyImmediate({ fromDate: next.fromDate, toDate: next.toDate });
          }}
          variant="inline"
        />
        <MinWeightInput
          draft={draft}
          setDraft={(s) => {
            const next = typeof s === "function" ? s(draft) : s;
            applyImmediate({ minWeight: next.minWeight });
          }}
          variant="inline"
        />
        <PhotoOnlyToggle
          draft={draft}
          setDraft={(s) => {
            const next = typeof s === "function" ? s(draft) : s;
            applyImmediate({ withPhotoOnly: next.withPhotoOnly });
          }}
          variant="inline"
        />
        {countActive(initial) > 0 ? (
          <Button variant="ghost" size="sm" onClick={reset}>
            <X className="mr-1 h-3.5 w-3.5" />
            Wyczyść
          </Button>
        ) : null}
      </div>
    </div>
  );
}

interface FilterState {
  species: string[];
  fromDate: string;
  toDate: string;
  minWeight: string;
  withPhotoOnly: boolean;
}

type SetState = React.Dispatch<React.SetStateAction<FilterState>>;

function emptyState(): FilterState {
  return {
    species: [],
    fromDate: "",
    toDate: "",
    minWeight: "",
    withPhotoOnly: false,
  };
}

function readState(params: URLSearchParams): FilterState {
  return {
    species: params.getAll("species"),
    fromDate: params.get("from") ?? "",
    toDate: params.get("to") ?? "",
    minWeight: params.get("minw") ?? "",
    withPhotoOnly: params.get("photo") === "1",
  };
}

function pushTo(
  router: ReturnType<typeof useRouter>,
  params: URLSearchParams,
  s: FilterState,
  startTransition: React.TransitionStartFunction,
) {
  const usp = new URLSearchParams();
  // Preserve sort/dir if present.
  for (const k of ["sort", "dir"] as const) {
    const v = params.get(k);
    if (v) usp.set(k, v);
  }
  s.species.forEach((sp) => usp.append("species", sp));
  if (s.fromDate) usp.set("from", s.fromDate);
  if (s.toDate) usp.set("to", s.toDate);
  if (s.minWeight) usp.set("minw", s.minWeight);
  if (s.withPhotoOnly) usp.set("photo", "1");
  const qs = usp.toString();
  startTransition(() => {
    router.replace(qs ? `?${qs}` : "?");
  });
}

function countActive(s: FilterState): number {
  return (
    (s.species.length > 0 ? 1 : 0) +
    (s.fromDate ? 1 : 0) +
    (s.toDate ? 1 : 0) +
    (s.minWeight ? 1 : 0) +
    (s.withPhotoOnly ? 1 : 0)
  );
}

function SpeciesPicker({
  draft,
  setDraft,
  variant = "stacked",
}: {
  draft: FilterState;
  setDraft: SetState;
  variant?: "stacked" | "inline";
}) {
  function toggle(species: string) {
    setDraft((d) => ({
      ...d,
      species: d.species.includes(species)
        ? d.species.filter((s) => s !== species)
        : [...d.species, species],
    }));
  }
  return (
    <div className={variant === "inline" ? "max-w-sm" : "space-y-2"}>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        Gatunek
      </Label>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {POPULAR_SPECIES_PL.map((s) => {
          const active = draft.species.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              className={
                "rounded-full border px-2.5 py-1 text-xs transition-colors " +
                (active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted")
              }
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateRangeInputs({
  draft,
  setDraft,
}: {
  draft: FilterState;
  setDraft: SetState;
  variant?: "stacked" | "inline";
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:max-w-md">
      <div className="space-y-1">
        <Label
          htmlFor="filter-from"
          className="text-xs uppercase tracking-wide text-muted-foreground"
        >
          Od
        </Label>
        <Input
          id="filter-from"
          type="date"
          value={draft.fromDate}
          onChange={(e) =>
            setDraft((d) => ({ ...d, fromDate: e.target.value }))
          }
        />
      </div>
      <div className="space-y-1">
        <Label
          htmlFor="filter-to"
          className="text-xs uppercase tracking-wide text-muted-foreground"
        >
          Do
        </Label>
        <Input
          id="filter-to"
          type="date"
          value={draft.toDate}
          onChange={(e) =>
            setDraft((d) => ({ ...d, toDate: e.target.value }))
          }
        />
      </div>
    </div>
  );
}

function MinWeightInput({
  draft,
  setDraft,
}: {
  draft: FilterState;
  setDraft: SetState;
  variant?: "stacked" | "inline";
}) {
  return (
    <div className="space-y-1 sm:max-w-[10rem]">
      <Label
        htmlFor="filter-minw"
        className="text-xs uppercase tracking-wide text-muted-foreground"
      >
        Min. waga (kg)
      </Label>
      <Input
        id="filter-minw"
        type="number"
        step={0.1}
        min={0}
        inputMode="decimal"
        value={draft.minWeight}
        onChange={(e) => setDraft((d) => ({ ...d, minWeight: e.target.value }))}
      />
    </div>
  );
}

function PhotoOnlyToggle({
  draft,
  setDraft,
}: {
  draft: FilterState;
  setDraft: SetState;
  variant?: "stacked" | "inline";
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id="filter-photo"
        checked={draft.withPhotoOnly}
        onCheckedChange={(v) =>
          setDraft((d) => ({ ...d, withPhotoOnly: v }))
        }
      />
      <Label htmlFor="filter-photo">Tylko ze zdjęciem</Label>
    </div>
  );
}
