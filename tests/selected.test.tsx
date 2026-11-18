import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "../src";
import type { MultipleComboboxProps } from "../src";
import { fruits, getStatus, setup } from "./helpers";

function renderMultiple(props: Partial<MultipleComboboxProps> = {}) {
  return setup(
    <>
      <Combobox
        label="Fruit"
        selection="multiple"
        options={fruits}
        defaultValue={["apple", "banana", "date"]}
        {...props}
      />
      <button type="button">Next</button>
    </>,
  );
}

function getToggle(count: number) {
  return screen.getByRole("button", { name: `${count} selected` });
}

function getSelectedList() {
  const toggle = screen.getByRole("button", { name: /selected$/ });
  const list = document.getElementById(
    toggle.getAttribute("aria-controls") ?? "",
  );
  if (!list) {
    throw new Error("The toggle does not control an element");
  }
  return list;
}

function getSelectedLabels() {
  return within(getSelectedList())
    .queryAllByRole("listitem", { hidden: true })
    .map((item) => item.textContent);
}

describe("selection summary", () => {
  it("writes the count in words, outside the input", () => {
    const { input } = renderMultiple();

    const toggle = getToggle(3);
    expect(toggle).toHaveTextContent("3 selected");
    expect(input.closest(".combobox-field")).not.toContainElement(toggle);
  });

  it("shows nothing when nothing is selected", () => {
    renderMultiple({ defaultValue: [] });

    expect(screen.queryByRole("button", { name: /selected$/ })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Clear selection" }),
    ).toBeNull();
  });

  it("uses the same summary for a single selected option", () => {
    renderMultiple({ defaultValue: ["apple"] });

    expect(getToggle(1)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clear selection" }),
    ).toBeInTheDocument();
  });

  it("starts collapsed by default", () => {
    renderMultiple();

    expect(getToggle(3)).toHaveAttribute("aria-expanded", "false");
    expect(getSelectedList()).not.toBeVisible();
  });

  it("starts expanded with defaultSelectedExpanded", () => {
    renderMultiple({ defaultSelectedExpanded: true });

    expect(getToggle(3)).toHaveAttribute("aria-expanded", "true");
    expect(getSelectedList()).toBeVisible();
    expect(getSelectedList()).toHaveAccessibleName("Selected: Fruit");
    expect(getSelectedLabels()).toEqual(["Apple", "Banana", "Date"]);
  });

  it("expands and collapses when the count is pressed", async () => {
    const { user } = renderMultiple();

    await user.click(getToggle(3));
    expect(getToggle(3)).toHaveAttribute("aria-expanded", "true");
    expect(getSelectedList()).toBeVisible();

    await user.click(getToggle(3));
    expect(getToggle(3)).toHaveAttribute("aria-expanded", "false");
    expect(getSelectedList()).not.toBeVisible();
  });

  it("stays expanded while the user keeps selecting", async () => {
    const { user, input } = renderMultiple({ defaultSelectedExpanded: true });

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Élderberry" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(getToggle(4)).toHaveAttribute("aria-expanded", "true");
    expect(getSelectedLabels()).toEqual([
      "Apple",
      "Banana",
      "Date",
      "Élderberry",
    ]);
  });

  it("remembers that it was expanded after the selection was cleared", async () => {
    const { user, input } = renderMultiple({ defaultSelectedExpanded: true });

    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Apricot" }));

    expect(getToggle(1)).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveFocus();
  });

  it("removes one option and moves focus to the next one", async () => {
    const onValueChange = vi.fn();
    const { user } = renderMultiple({
      defaultSelectedExpanded: true,
      onValueChange,
    });

    await user.click(screen.getByRole("button", { name: "Remove Banana" }));

    expect(onValueChange).toHaveBeenCalledWith(["apple", "date"]);
    expect(screen.getByRole("button", { name: "Remove Date" })).toHaveFocus();
    expect(getStatus()).toHaveTextContent("Banana, deselected");
  });

  it("moves focus to the previous option when removing the last one", async () => {
    const { user } = renderMultiple({ defaultSelectedExpanded: true });

    await user.click(screen.getByRole("button", { name: "Remove Date" }));

    expect(screen.getByRole("button", { name: "Remove Banana" })).toHaveFocus();
  });

  it("returns focus to the input when the only option is removed", async () => {
    const { user, input } = renderMultiple({
      defaultValue: ["apple"],
      defaultSelectedExpanded: true,
    });

    await user.click(screen.getByRole("button", { name: "Remove Apple" }));

    expect(input).toHaveFocus();
    expect(screen.queryByRole("button", { name: /selected$/ })).toBeNull();
  });

  it("clears everything with the labeled button and returns focus to the input", async () => {
    const onValueChange = vi.fn();
    const { user, input } = renderMultiple({ onValueChange });

    await user.click(screen.getByRole("button", { name: "Clear selection" }));

    expect(onValueChange).toHaveBeenCalledWith([]);
    expect(input).toHaveFocus();
    expect(getStatus()).toHaveTextContent("Selection cleared");
  });

  it("closes the options when focus moves from the input to the summary", async () => {
    const { user, input } = renderMultiple();

    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");

    await user.tab();

    expect(getToggle(3)).toHaveFocus();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the search text while focus stays inside the component", async () => {
    const { user, input } = renderMultiple();

    await user.type(input, "ki");
    await user.tab();

    expect(input).toHaveValue("ki");
  });

  it("lets a disabled combobox's selection be reviewed but not changed", async () => {
    const { user } = renderMultiple({ disabled: true });

    await user.click(getToggle(3));

    expect(getSelectedList()).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Clear selection" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove Apple" })).toBeDisabled();
  });

  it("accepts translated messages", () => {
    renderMultiple({
      messages: {
        selectedCount: (count) => `${count} valgt`,
        clearSelection: "Fjern alle",
      },
    });

    expect(screen.getByRole("button", { name: "3 valgt" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Fjern alle" }),
    ).toBeInTheDocument();
  });
});
