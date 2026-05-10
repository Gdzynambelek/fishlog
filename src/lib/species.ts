/**
 * Popular Polish freshwater fish species. Used for the species autocomplete
 * in catch form. Free text is also allowed — this list is just suggestions.
 *
 * Source: spec brief.
 */
export const POPULAR_SPECIES_PL = [
  "Karp",
  "Szczupak",
  "Okoń",
  "Leszcz",
  "Płoć",
  "Sandacz",
  "Sum",
  "Amur",
  "Karaś",
  "Lin",
  "Węgorz",
  "Kleń",
  "Jaź",
  "Boleń",
  "Pstrąg tęczowy",
  "Pstrąg potokowy",
  "Lipień",
] as const;

export type PopularSpecies = (typeof POPULAR_SPECIES_PL)[number];
