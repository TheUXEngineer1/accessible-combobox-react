import { act, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "../src";
import { fruits, getOptionLabels, setup } from "./helpers";

describe("controlled and uncontrolled state", () => {
  it("lets you type with only onInputValueChange passed", async () => {
    const onInputValueChange = vi.fn();
    const { user, input } = setup(
      <Combobox
        label="Fruit"
        options={fruits}
        onInputValueChange={onInputValueChange}
      />,
    );

    await user.type(input, "ban");

    expect(input).toHaveValue("ban");
    expect(onInputValueChange).toHaveBeenLastCalledWith("ban");
  });

  it("follows a controlled input value", async () => {
    function Controlled() {
      const [text, setText] = useState("");
      return (
        <Combobox
          label="Fruit"
          selection="multiple"
          options={fruits}
          inputValue={text}
          onInputValueChange={(next) => setText(next.toUpperCase())}
        />
      );
    }
    const { user, input } = setup(<Controlled />);

    await user.type(input, "ap");

    expect(input).toHaveValue("AP");
    expect(getOptionLabels()).toEqual(["Apple", "Apricot"]);
  });

  it("does not change a controlled value on its own", async () => {
    const onValueChange = vi.fn();
    const { user, input } = setup(
      <Combobox
        label="Fruit"
        options={fruits}
        value="apple"
        onValueChange={onValueChange}
      />,
    );

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Banana" }));

    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(input).toHaveValue("Apple");
  });

  it("shows the new label when a controlled value changes", () => {
    const { input, rerender } = setup(
      <Combobox label="Fruit" options={fruits} value="apple" />,
    );

    rerender(<Combobox label="Fruit" options={fruits} value="date" />);

    expect(input).toHaveValue("Date");
  });

  it("treats null as a controlled empty value", () => {
    const { input } = setup(
      <Combobox label="Fruit" options={fruits} value={null} />,
    );

    expect(input).toHaveValue("");
  });

  it("selects by value even when option objects are recreated", async () => {
    function Recreating() {
      const [value, setValue] = useState<string[]>([]);
      const options = fruits.map((fruit) => ({ ...fruit }));
      return (
        <Combobox
          label="Fruit"
          selection="multiple"
          options={options}
          value={value}
          onValueChange={setValue}
        />
      );
    }
    const { user, input } = setup(<Recreating />);

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Apple" }));
    await user.click(screen.getByRole("option", { name: "Apple" }));

    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.queryByRole("button", { name: /Clear \d/ })).toBeNull();
  });

  it("follows a controlled open state", async () => {
    const onOpenChange = vi.fn();
    const { user, input, rerender } = setup(
      <Combobox
        label="Fruit"
        options={fruits}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );

    await user.click(input);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(input).toHaveAttribute("aria-expanded", "false");

    rerender(
      <Combobox
        label="Fruit"
        options={fruits}
        open
        onOpenChange={onOpenChange}
      />,
    );
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("shows options unfiltered with filter={false}", async () => {
    const { user, input } = setup(
      <Combobox label="Fruit" options={fruits} filter={false} />,
    );

    await user.type(input, "zzz");

    expect(getOptionLabels()).toHaveLength(fruits.length);
  });

  it("accepts a custom filter", async () => {
    const { user, input } = setup(
      <Combobox
        label="Fruit"
        options={fruits}
        filter={(option, query) =>
          option.label.toLowerCase().startsWith(query.toLowerCase())
        }
      />,
    );

    await user.type(input, "a");

    expect(getOptionLabels()).toEqual(["Apple", "Apricot"]);
  });

  it("forwards the ref to the input", () => {
    const ref = { current: null as HTMLInputElement | null };
    setup(<Combobox label="Fruit" options={fruits} ref={ref} />);

    expect(ref.current).toBe(screen.getByRole("combobox"));
    act(() => ref.current?.focus());
    expect(ref.current).toHaveFocus();
  });

  it("renders custom option content", () => {
    setup(
      <Combobox
        label="Fruit"
        options={fruits}
        defaultValue="apple"
        renderOption={(option, { selected }) =>
          `${option.label}${selected ? " (yours)" : ""}`
        }
      />,
    );

    expect(
      screen.getByRole("option", { name: "Apple (yours)", hidden: true }),
    ).toBeInTheDocument();
  });

  it("keeps the list visible in inline mode", async () => {
    const { user, input } = setup(
      <>
        <Combobox label="Fruit" options={fruits} inline />
        <button type="button">Next</button>
      </>,
    );

    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Show options", hidden: true }),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("listbox")).toBeVisible();
  });
});
