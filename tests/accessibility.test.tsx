import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Combobox } from "../src";
import {
  fruits,
  getActiveOption,
  getListbox,
  getOptions,
  getStatus,
  setup,
} from "./helpers";

describe("accessibility", () => {
  it("names the combobox and listbox from the label", () => {
    const { input } = setup(<Combobox label="Fruit" options={fruits} />);

    expect(screen.getByRole("combobox", { name: "Fruit" })).toBe(input);
    expect(getListbox()).toHaveAccessibleName("Fruit");
  });

  it("keeps a visually hidden label accessible", () => {
    setup(<Combobox label="Fruit" hideLabel options={fruits} />);

    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
  });

  it("wires up the combobox attributes", async () => {
    const { user, input } = setup(<Combobox label="Fruit" options={fruits} />);

    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-controls", getListbox().id);
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).not.toHaveAttribute("aria-activedescendant");

    await user.click(input);
    await user.keyboard("{ArrowDown}");

    expect(getActiveOption(input)).toBe(getOptions()[0]);
  });

  it("removes aria-activedescendant when the popup closes", async () => {
    const { user, input } = setup(<Combobox label="Fruit" options={fruits} />);

    await user.click(input);
    await user.keyboard("{ArrowDown}{Escape}");

    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("marks disabled and selected options", () => {
    setup(<Combobox label="Fruit" options={fruits} defaultValue="apple" />);

    const [apple, , , cherry] = getOptions();
    expect(apple).toHaveAttribute("aria-selected", "true");
    expect(cherry).toHaveAttribute("aria-disabled", "true");
    expect(cherry).toHaveAttribute("aria-selected", "false");
  });

  it("gives every instance unique, valid option ids", () => {
    const values = [
      { value: "a b", label: "With space" },
      { value: "a/b", label: "With slash" },
    ];
    render(
      <>
        <Combobox label="One" options={values} />
        <Combobox label="Two" options={values} />
      </>,
    );

    const ids = screen
      .getAllByRole("option", { hidden: true })
      .map((option) => option.id);
    expect(new Set(ids).size).toBe(4);
    for (const id of ids) {
      expect(id).not.toMatch(/\s/);
    }
  });

  it("describes the input with the description and the multiple hint", () => {
    const { input } = setup(
      <Combobox
        label="Fruit"
        description="Pick the ones you like."
        selection="multiple"
        options={fruits}
      />,
    );

    expect(input).toHaveAccessibleDescription(
      "Pick the ones you like. You can select more than one option.",
    );
  });

  it("adds the selected count to the input's description", async () => {
    const { user, input } = setup(
      <Combobox
        label="Fruit"
        selection="multiple"
        options={fruits}
        defaultValue={["apple"]}
      />,
    );

    expect(input).toHaveAccessibleDescription(
      "You can select more than one option. 1 selected",
    );

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Banana" }));

    expect(input).toHaveAccessibleDescription(
      "You can select more than one option. 2 selected",
    );
  });

  it("announces selection and deselection", async () => {
    const { user, input } = setup(
      <Combobox label="Fruit" selection="multiple" options={fruits} />,
    );

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Apple" }));
    expect(getStatus()).toHaveTextContent("Apple, selected");

    await user.click(screen.getByRole("option", { name: "Apple" }));
    expect(getStatus()).toHaveTextContent("Apple, deselected");
  });

  it("announces clearing everything", async () => {
    const { user } = setup(
      <Combobox
        label="Fruit"
        selection="multiple"
        options={fruits}
        defaultValue={["apple"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear selection" }));

    expect(getStatus()).toHaveTextContent("Selection cleared");
  });

  it("re-announces the same message by replacing the live region content", async () => {
    const { user, input } = setup(
      <Combobox label="Fruit" selection="multiple" options={fruits} />,
    );

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Apple" }));
    const first = getStatus().firstChild;
    await user.click(screen.getByRole("option", { name: "Apple" }));
    await user.click(screen.getByRole("option", { name: "Apple" }));

    expect(getStatus()).toHaveTextContent("Apple, selected");
    expect(getStatus().firstChild).not.toBe(first);
  });

  it("announces the number of results after typing stops", async () => {
    const { user, input } = setup(<Combobox label="Fruit" options={fruits} />);

    await user.type(input, "ap");

    await waitFor(() =>
      expect(getStatus()).toHaveTextContent("2 results available"),
    );
  });

  it("accepts translated messages", async () => {
    const { user, input } = setup(
      <Combobox
        label="Frukt"
        options={fruits}
        messages={{ noResults: "Ingen treff", clearInput: "Tøm" }}
      />,
    );

    await user.type(input, "xyz");

    expect(screen.getByText("Ingen treff")).toBeVisible();
    expect(screen.getByRole("button", { name: "Tøm" })).toBeInTheDocument();
  });
});
