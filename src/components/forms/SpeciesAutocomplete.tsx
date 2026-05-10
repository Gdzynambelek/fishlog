"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Lightbulb } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  POPULAR_SPECIES_PL,
  suggestSpeciesCorrection,
} from "@/lib/species";
import { cn } from "@/lib/utils";

/**
 * Combobox-style picker for fish species.
 *
 * Behavior:
 *  - Pick from the popular species list (substring match by cmdk).
 *  - Type a custom name (free text) — accepted as-is.
 *  - When the typed value looks like a typo of a known species (Levenshtein
 *    fuzzy match), surface a "Może chodziło Ci o…" group with the canonical
 *    name as a one-tap correction. The "Użyj wpisanego" entry stays — user
 *    can override and keep their spelling.
 */
export function SpeciesAutocomplete({
  value,
  onChange,
  id,
  invalid,
}: {
  value: string;
  onChange: (next: string) => void;
  id?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const trimmedSearch = search.trim();
  const exactMatch = useMemo(
    () =>
      POPULAR_SPECIES_PL.some(
        (s) => s.toLowerCase() === trimmedSearch.toLowerCase(),
      ),
    [trimmedSearch],
  );
  const suggestion = useMemo(
    () => (exactMatch ? null : suggestSpeciesCorrection(trimmedSearch)),
    [trimmedSearch, exactMatch],
  );
  const showCustom = trimmedSearch.length >= 2 && !exactMatch;

  function pick(name: string) {
    onChange(name);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-12 w-full justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          {value || "Wybierz lub wpisz gatunek…"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter>
          <CommandInput
            placeholder="Szukaj lub wpisz własny…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Brak wyników.</CommandEmpty>

            {suggestion ? (
              <CommandGroup heading="Może chodziło Ci o…">
                <CommandItem
                  value={`__suggestion__:${suggestion}`}
                  onSelect={() => pick(suggestion)}
                  className="data-[selected=true]:bg-accent/30"
                >
                  <Lightbulb className="mr-2 h-4 w-4 text-[hsl(41_73%_56%)]" />
                  <span className="font-medium">{suggestion}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    (poprawiona pisownia)
                  </span>
                </CommandItem>
              </CommandGroup>
            ) : null}

            {showCustom ? (
              <CommandGroup heading="Użyj wpisanego">
                <CommandItem
                  value={`__custom__:${trimmedSearch}`}
                  onSelect={() => pick(trimmedSearch)}
                >
                  &bdquo;{trimmedSearch}&rdquo;
                  {suggestion ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (zostaw moją pisownię)
                    </span>
                  ) : null}
                </CommandItem>
              </CommandGroup>
            ) : null}

            <CommandGroup heading="Popularne gatunki">
              {POPULAR_SPECIES_PL.map((species) => (
                <CommandItem
                  key={species}
                  value={species}
                  onSelect={() => pick(species)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === species ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {species}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
