import type { ComboboxMessages } from "./types";

export const defaultMessages: ComboboxMessages = {
  noResults: "No results",
  clearInput: "Clear",
  toggle: "Show options",
  multipleHint: "You can select more than one option.",
  required: "Select an option.",
  selectionCleared: "Selection cleared",
  selected: (label) => `${label}, selected`,
  deselected: (label) => `${label}, deselected`,
  selectedCount: (count) => `${count} selected`,
  clearSelection: "Clear selection",
  removeItem: (label) => `Remove ${label}`,
  selectedListLabel: (label) => `Selected: ${label}`,
  results: (count) => {
    if (count === 0) {
      return "No results";
    }
    return count === 1 ? "1 result available" : `${count} results available`;
  },
};

export function resolveMessages(
  messages: Partial<ComboboxMessages> | undefined,
): ComboboxMessages {
  return { ...defaultMessages, ...messages };
}
