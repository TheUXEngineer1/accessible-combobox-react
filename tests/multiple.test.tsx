import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "../src";
import {
  fruits,
  getActiveOption,
  getListbox,
  getOptionLabels,
  setup,
} from "./helpers";

describe("multiple selection", () => {
  it("toggles options and keeps the popup open", async () => {
    const onValueChange = vi.fn();
    const { user, input } = setup(
      <Combobox
        label="Fruit"
        selection="multiple"
        options={fruits}
        onValueChange={onValueChange}
      />,
    );

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Apple" }));
    await user.click(screen.getByRole("option", { name: "Banana" }));

    expect(onValueChange).toHaveBeenLastCalledWith(["apple", "banana"]);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.click(screen.getByRole("option", { name: "Apple" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["banana"]);
  });

  it("marks the listbox as multiselectable", () => {
    setup(<Combobox label="Fruit" selection="multiple" options={fruits} />);

    expect(getListbox()).toHaveAttribute("aria-multiselectable", "true");
  });

  it("clears the search after selecting and keeps the option active", async () => {
    const { user, input } = setup(
      <Combobox label="Fruit" selection="multiple" options={fruits} />,
    );

    await user.type(input, "ban");
    expect(getOptionLabels()).toEqual(["Banana"]);

    await user.keyboard("{ArrowDown}{Enter}");

    expect(input).toHaveValue("");
    expect(getOptionLabels()).toHaveLength(fruits.length);
    expect(getActiveOption(input)).toHaveTextContent("Banana");
  });

  it("clears an unfinished search when focus leaves", async () => {
    const { user, input } = setup(
      <>
        <Combobox label="Fruit" selection="multiple" options={fruits} />
        <button type="button">Next</button>
      </>,
    );

    await user.type(input, "ban");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("does not deselect with Backspace, since the selection may be collapsed", async () => {
    const onValueChange = vi.fn();
    const { user, input } = setup(
      <Combobox
        label="Fruit"
        selection="multiple"
        options={fruits}
        defaultValue={["apple"]}
        onValueChange={onValueChange}
      />,
    );

    input.focus();
    await user.keyboard("{Backspace}");

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
