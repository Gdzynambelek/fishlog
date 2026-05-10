/**
 * Popular Polish freshwater + migratory fish. Free text is allowed in the
 * form, this list drives autocomplete suggestions and typo correction.
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
  "Jesiotr",
  "Łosoś",
  "Troć",
  "Sieja",
  "Miętus",
  "Tołpyga",
] as const;

export type PopularSpecies = (typeof POPULAR_SPECIES_PL)[number];

/**
 * Normalize for fuzzy matching: lowercase + strip Polish diacritics so that
 * "Łosoś" / "losos" / "ŁOSOŚ" all collapse to "losos".
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    // strip combining diacritical marks (U+0300..U+036F)
    .replace(/[̀-ͯ]/g, "")
    // ł / Ł have no decomposition, replace explicitly
    .replace(/[łŁ]/g, "l")

    .trim();
}

/** Classic Levenshtein edit distance (DP, O(|a|·|b|)). */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  // Using a flat Int8Array would be slightly faster but adds complexity;
  // these strings are <30 chars so JS arrays are fine.
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = new Array<number>(n + 1);
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      const del = (prev[j] ?? 0) + 1;
      const ins = (cur[j - 1] ?? 0) + 1;
      const sub = (prev[j - 1] ?? 0) + cost;
      cur[j] = Math.min(del, ins, sub);
    }
    prev = cur;
  }
  return prev[n] ?? Math.max(m, n);
}

/**
 * If the user's input looks like a typo of a known species, return the
 * canonical name. Returns null if the input is too short, exactly matches
 * a known name, or is too dissimilar to anything we know.
 *
 * Tunable thresholds:
 *  - At most 2 edits, OR edit ratio ≤ 0.3 of max length.
 *  - Length-difference > 4 disqualifies (e.g. "Jesiotr biały" should NOT
 *    be auto-corrected to "Jesiotr").
 */
export function suggestSpeciesCorrection(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed.length < 3) return null;
  const normalizedInput = normalize(trimmed);

  // Exact match → no suggestion.
  if (POPULAR_SPECIES_PL.some((s) => normalize(s) === normalizedInput)) {
    return null;
  }

  let best: { species: string; distance: number } | null = null;
  for (const species of POPULAR_SPECIES_PL) {
    const candidate = normalize(species);
    if (Math.abs(candidate.length - normalizedInput.length) > 4) continue;
    const d = levenshtein(normalizedInput, candidate);
    if (best === null || d < best.distance) {
      best = { species, distance: d };
    }
  }

  if (!best) return null;

  const maxLen = Math.max(trimmed.length, best.species.length);
  const ratio = best.distance / maxLen;
  if (best.distance <= 2 || ratio <= 0.3) {
    return best.species;
  }
  return null;
}
