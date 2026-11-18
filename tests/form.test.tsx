import { screen } from "@testing-library/react";
import type { FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "../src";
import { fruits, setup } from "./helpers";

function formValues(form: HTMLFormElement) {
  return new FormData(form).getAll("fruit");
}

describe("forms", () => {
  it("submits the selected value under the given name", async () => {
    const { user, input, container } = setup(
      <form>
        <Combobox label="Fruit" options={fruits} name="fruit" />
      </form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;

    expect(formValues(form)).toEqual([""]);

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Banana" }));

    expect(formValues(form)).toEqual(["banana"]);
  });

  it("submits one entry per value in multiple modes", () => {
    const { container } = setup(
      <form>
        <Combobox
          label="Fruit"
          selection="multiple"
          options={fruits}
          name="fruit"
          defaultValue={["apple", "date"]}
        />
      </form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;

    expect(formValues(form)).toEqual(["apple", "date"]);
  });

  it("lets Enter submit the form when the popup is closed", async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    const { user, input } = setup(
      <form onSubmit={onSubmit}>
        <Combobox label="Fruit" options={fruits} defaultValue="apple" />
        <button type="submit">Send</button>
      </form>,
    );

    input.focus();
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not submit when Enter selects an option", async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    const { user, input } = setup(
      <form onSubmit={onSubmit}>
        <Combobox label="Fruit" options={fruits} />
        <button type="submit">Send</button>
      </form>,
    );

    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(input).toHaveValue("Apple");
  });

  it("blocks submission while required and empty", async () => {
    const { user, input } = setup(
      <form>
        <Combobox
          label="Fruit"
          selection="multiple"
          options={fruits}
          required
        />
      </form>,
    );

    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toBeInvalid();

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Apple" }));

    expect(input).toBeValid();
  });

  it("returns to the default value when the form is reset", async () => {
    const { user, input } = setup(
      <form>
        <Combobox
          label="Fruit"
          options={fruits}
          name="fruit"
          defaultValue="apple"
        />
        <button type="reset">Reset</button>
      </form>,
    );

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Banana" }));
    expect(input).toHaveValue("Banana");

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(input).toHaveValue("Apple");
  });

  it("leaves values out of the form when disabled", () => {
    const { container } = setup(
      <form>
        <Combobox
          label="Fruit"
          options={fruits}
          name="fruit"
          defaultValue="apple"
          disabled
        />
      </form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;

    expect(formValues(form)).toEqual([]);
  });
});
