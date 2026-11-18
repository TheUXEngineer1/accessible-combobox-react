import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import type { ComboboxOption } from "../src";

export const fruits: ComboboxOption[] = [
  { value: "apple", label: "Apple" },
  { value: "apricot", label: "Apricot" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry", disabled: true },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Élderberry" },
];

export function setup(ui: ReactElement) {
  const user = userEvent.setup();
  const result = render(ui);
  const input = screen.getByRole("combobox");
  return { user, input, ...result };
}

export function getListbox() {
  return screen.getByRole("listbox", { hidden: true });
}

export function getOptions() {
  return within(getListbox()).queryAllByRole("option", { hidden: true });
}

export function getOptionLabels() {
  return getOptions().map((option) => option.textContent);
}

export function getActiveOption(input: HTMLElement) {
  const id = input.getAttribute("aria-activedescendant");
  return id ? document.getElementById(id) : null;
}

export function getStatus() {
  return screen.getByRole("status");
}
