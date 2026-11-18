import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "../src";
import {
  fruits,
  getActiveOption,
  getListbox,
  getOptionLabels,
  getOptions,
  setup,
} from "./helpers";

describe("single selection", () => {
  it("opens on click and selects an option with the pointer", async () => {
    const onValueChange = vi.fn();
    const { user, input } = setup(
      <Combobox label="Fruit" options={fruits} onValueChange={onValueChange} />,
    );

    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(getListbox()).toBeVisible();

    await user.click(screen.getByRole("option", { name: "Banana" }));

    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(input).toHaveValue("Banana");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveFocus();
  });

  it("filters by typed text, ignoring case and accents", async () => {
    const { user, input } = setup(<Combobox label="Fruit" options={fruits} />);

    await user.type(input, "AP");
    expect(getOptionLabels()).toEqual(["Apple", "Apricot"]);

    await user.clear(input);
    await user.type(input, "elder");
    expect(getOptionLabels()).toEqual(["Élderberry"]);
  });

  it("shows a message when nothing matches", async () => {
    const { user, input } = setup(<Combobox label="Fruit" options={fruits} />);

    await user.type(input, "xyz");

    expect(getOptions()).toHaveLength(0);
    expect(screen.getByText("No results")).toBeVisible();
  });

  it("selects with the keyboard and skips disabled options", async () => {
    const onValueChange = vi.fn();
    const { user, input } = setup(
      <Combobox label="Fruit" options={fruits} onValueChange={onValueChange} />,
    );

    await user.click(input);
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");
    expect(getActiveOption(input)).toHaveTextContent("Date");

    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("date");
    expect(input).toHaveValue("Date");
  });

  it("opens with ArrowDown on the selected option", async () => {
    const { user, input } = setup(
      <Combobox label="Fruit" options={fruits} defaultValue="banana" />,
    );

    input.focus();
    await user.keyboard("{ArrowDown}");

    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(getActiveOption(input)).toHaveTextContent("Banana");
    // All options are shown while the input holds the selected label.
    expect(getOptions()).toHaveLength(fruits.length);
  });

  it("starts from the selected option after opening with a click", async () => {
    const { user, input } = setup(
      <Combobox label="Fruit" options={fruits} defaultValue="date" />,
    );

    await user.click(input);
    await user.keyboard("{ArrowDown}");

    expect(getActiveOption(input)).toHaveTextContent("Date");
  });

  it("opens with ArrowUp on the last enabled option", async () => {
    const { user, input } = setup(<Combobox label="Fruit" options={fruits} />);

    input.focus();
    await user.keyboard("{ArrowUp}");

    expect(getActiveOption(input)).toHaveTextContent("Élderberry");
  });

  it("opens without activating an option with Alt+ArrowDown", async () => {
    const { user, input } = setup(<Combobox label="Fruit" options={fruits} />);

    input.focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("supports Home and End only while an option is active", async () => {
    const { user, input } = setup(<Combobox label="Fruit" options={fruits} />);

    await user.click(input);
    await user.keyboard("{ArrowDown}{End}");
    expect(getActiveOption(input)).toHaveTextContent("Élderberry");

    await user.keyboard("{Home}");
    expect(getActiveOption(input)).toHaveTextContent("Apple");
  });

  it("closes on Escape and restores the selected label", async () => {
    const { user, input } = setup(
      <Combobox label="Fruit" options={fruits} defaultValue="apple" />,
    );

    await user.click(input);
    await user.keyboard("{Backspace}{Backspace}");
    expect(input).toHaveValue("App");

    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("Apple");
  });

  it("does not clear the input on Escape when closed", async () => {
    const { user, input } = setup(
      <Combobox label="Fruit" options={fruits} defaultValue="apple" />,
    );

    input.focus();
    await user.keyboard("{Escape}");

    expect(input).toHaveValue("Apple");
  });

  it("restores the selected label when focus leaves", async () => {
    const { user, input } = setup(
      <>
        <Combobox label="Fruit" options={fruits} defaultValue="apple" />
        <button type="button">Next</button>
      </>,
    );

    await user.click(input);
    await user.keyboard("{Backspace}");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(input).toHaveValue("Apple");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("clears the selection when the input is emptied", async () => {
    const onValueChange = vi.fn();
    const { user, input } = setup(
      <Combobox
        label="Fruit"
        options={fruits}
        defaultValue="apple"
        onValueChange={onValueChange}
      />,
    );

    await user.clear(input);

    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("clears text and selection with the clear button", async () => {
    const onValueChange = vi.fn();
    const { user, input } = setup(
      <Combobox
        label="Fruit"
        options={fruits}
        defaultValue="apple"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("toggles the popup with the chevron button", async () => {
    const { user, input } = setup(<Combobox label="Fruit" options={fruits} />);
    const toggle = screen.getByRole("button", {
      name: "Show options",
      hidden: true,
    });

    await user.click(toggle);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveFocus();

    await user.click(toggle);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the selection when the selected option is chosen again", async () => {
    const onValueChange = vi.fn();
    const { user, input } = setup(
      <Combobox
        label="Fruit"
        options={fruits}
        defaultValue="apple"
        onValueChange={onValueChange}
      />,
    );

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Apple" }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("Apple");
  });

  it("ignores clicks on disabled options", async () => {
    const onValueChange = vi.fn();
    const { user, input } = setup(
      <Combobox label="Fruit" options={fruits} onValueChange={onValueChange} />,
    );

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Cherry" }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("does not open or respond when disabled", async () => {
    const { user, input } = setup(
      <Combobox label="Fruit" options={fruits} defaultValue="apple" disabled />,
    );

    expect(input).toBeDisabled();
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
  });
});
