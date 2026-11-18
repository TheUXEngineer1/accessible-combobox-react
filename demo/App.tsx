import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { Combobox } from "../src";
import { countries, fruits } from "./countries";
import demoCss from "./demo.css?inline";
import tokensCss from "./tokens.css?inline";

const pageCss = demoCss + tokensCss;
const noPageCssQuery = "?styles=none";

function FormExample() {
  const [submitted, setSubmitted] = useState("Nothing submitted yet.");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(JSON.stringify(Object.fromEntries(data.entries())));
  };

  return (
    <form onSubmit={handleSubmit} className="demo-form">
      <Combobox
        label="Country of residence"
        description="Required. The form is blocked until you pick one."
        options={countries}
        name="country"
        required
      />
      <div className="demo-actions">
        <button type="submit" className="demo-button">
          Submit
        </button>
        <button type="reset" className="demo-button">
          Reset
        </button>
      </div>
      <output className="demo-output">{submitted}</output>
    </form>
  );
}

function ControlledExample() {
  const [value, setValue] = useState<string[]>(["apple", "kiwi"]);

  return (
    <>
      <Combobox
        label="Favorite fruits"
        selection="multiple"
        options={fruits}
        value={value}
        onValueChange={setValue}
      />
      <div className="demo-actions">
        <button
          type="button"
          className="demo-button"
          onClick={() => setValue(fruits.map((fruit) => fruit.value))}
        >
          Select all
        </button>
      </div>
      <output className="demo-output">value: {JSON.stringify(value)}</output>
    </>
  );
}

function ServerFilterExample() {
  const [query, setQuery] = useState("");
  const [value, setValue] = useState<string | null>(null);
  const matches = countries
    .filter((country) =>
      country.label.toLowerCase().startsWith(query.toLowerCase()),
    )
    .slice(0, 5);
  // Keep the selected option available so its label can still be shown.
  const selected = countries.find((country) => country.value === value);
  const options =
    selected && !matches.includes(selected) ? [...matches, selected] : matches;

  return (
    <Combobox
      label="Country (starts with, first five)"
      description="Filtering is done outside the component with filter={false}."
      options={options}
      filter={false}
      value={value}
      onValueChange={setValue}
      onInputValueChange={setQuery}
    />
  );
}

export function App() {
  const [pageStyles, setPageStyles] = useState(
    () => window.location.search !== noPageCssQuery,
  );

  const togglePageStyles = (on: boolean) => {
    setPageStyles(on);
    window.history.replaceState(
      null,
      "",
      on ? window.location.pathname : noPageCssQuery,
    );
  };

  return (
    <>
      {pageStyles ? <style>{pageCss}</style> : null}
      <header>
        <h1>Combobox</h1>
        <p>
          An accessible, dependency-free React combobox with single and multiple
          selection.
        </p>
        <p>
          Everything you see in the comboboxes comes from the package’s{" "}
          <code>styles.css</code>. This page’s own CSS only lays out the page
          and maps its color tokens onto the <code>--combobox-*</code>{" "}
          variables. Turn it off to see the comboboxes with no page CSS at all.
        </p>
        <p>
          <label>
            <input
              type="checkbox"
              checked={pageStyles}
              onChange={(event) => togglePageStyles(event.target.checked)}
            />{" "}
            Page CSS
          </label>
        </p>
      </header>
      <main>
        <section>
          <h2>Single selection</h2>
          <Combobox label="Country" options={countries} defaultValue="norway" />
        </section>
        <section>
          <h2>Multiple selection, controlled</h2>
          <ControlledExample />
        </section>
        <section>
          <h2>Multiple selection, expanded by default</h2>
          <Combobox
            label="Countries visited"
            selection="multiple"
            options={countries}
            defaultValue={["france", "japan", "peru"]}
            defaultSelectedExpanded
          />
        </section>
        <section>
          <h2>Form with validation and reset</h2>
          <FormExample />
        </section>
        <section>
          <h2>Custom filtering</h2>
          <ServerFilterExample />
        </section>
        <section>
          <h2>Inline</h2>
          <Combobox
            label="Fruit"
            inline
            selection="multiple"
            options={fruits}
            messages={{ multipleHint: "Select every fruit you like." }}
          />
        </section>
        <section>
          <h2>Themed with CSS variables</h2>
          <p>
            Set <code>--combobox-*</code> variables on the component, a wrapper
            or <code>:root</code>.
          </p>
          <div
            style={
              {
                "--combobox-color-accent":
                  "light-dark(oklch(45% 0.13 150deg), oklch(78% 0.13 150deg))",
                "--combobox-radius": "1.25rem",
                "--combobox-space": "1.25rem",
                "--combobox-max-inline-size": "28rem",
              } as CSSProperties
            }
          >
            <Combobox
              label="Countries visited"
              selection="multiple"
              options={countries}
              defaultValue={["chile", "kenya"]}
              defaultSelectedExpanded
            />
          </div>
        </section>
        <section>
          <h2>Disabled</h2>
          <Combobox
            label="Locked country"
            options={countries}
            defaultValue="peru"
            disabled
          />
        </section>
      </main>
    </>
  );
}
