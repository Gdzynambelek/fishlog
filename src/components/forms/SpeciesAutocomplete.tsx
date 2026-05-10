"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { POPULAR_SPECIES_PL } from "@/lib/species";
import { cn } from "@/lib/utils";

/**
 * Combobox-style picker for fish species. The user can pick from a fixed
 * list of popular Polish species OR type a custom name (free text).
 *
 * The "free text" path is important — every angler will eventually catch
 * something not on our list (or use a regional name).
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
  const showCustom =
    trimmedSearch.length >= 2 &&
    !POPULAR_SPECIES_PL.some(
      (s) => s.toLowerCase() === trimmedSearch.toLowerCase(),
    );

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
            {showCustom ? (
              <CommandGroup heading="Użyj wpisanego">
                <CommandItem
                  value={trimmedSearch}
                  onSelect={() => {
                    onChange(trimmedSearch);
                    setOpen(false);
                  }}
                >
                  &bdquo;{trimmedSearch}&rdquo;
                </CommandItem>
              </CommandGroup>
            ) : null}
            <CommandGroup heading="Popularne gatunki">
              {POPULAR_SPECIES_PL.map((species) => (
                <CommandItem
                  key={species}
                  value={species}
                  onSelect={() => {
                    onChange(species);
                    setOpen(false);
                  }}
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
