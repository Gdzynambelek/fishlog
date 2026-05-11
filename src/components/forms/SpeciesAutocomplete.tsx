"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();
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
          {value || t("species.selectOrType")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter>
          <CommandInput
            placeholder={t("species.searchPlaceholder")}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{t("species.noResults")}</CommandEmpty>

            {suggestion ? (
              <CommandGroup heading={t("species.didYouMean")}>
                <CommandItem
                  value={`__suggestion__:${suggestion}`}
                  onSelect={() => pick(suggestion)}
                  className="data-[selected=true]:bg-accent/30"
                >
                  <Lightbulb className="mr-2 h-4 w-4 text-[hsl(41_73%_56%)]" />
                  <span className="font-medium">{suggestion}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {t("species.correctedSpelling")}
                  </span>
                </CommandItem>
              </CommandGroup>
            ) : null}

            {showCustom ? (
              <CommandGroup heading={t("species.useCustom")}>
                <CommandItem
                  value={`__custom__:${trimmedSearch}`}
                  onSelect={() => pick(trimmedSearch)}
                >
                  &bdquo;{trimmedSearch}&rdquo;
                  {suggestion ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {t("species.keepMine")}
                    </span>
                  ) : null}
                </CommandItem>
              </CommandGroup>
            ) : null}

            <CommandGroup heading={t("species.popular")}>
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
