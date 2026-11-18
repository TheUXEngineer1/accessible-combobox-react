import type { ComboboxFilter } from "./types";

export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();
}

/** Case- and accent-insensitive "contains" match on the option label. */
export const defaultFilter: ComboboxFilter = (option, query) =>
  normalizeText(option.label).includes(normalizeText(query));
