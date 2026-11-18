# accessible-combobox-react

> **Experimental.** This component is still being developed and tested, and it isn’t ready for production use. The API and styles may change between versions without notice.

An accessible React combobox with single and multiple selection. It has no runtime dependencies apart from React 19, and it follows the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) with a listbox popup and manual selection.

It works out of the box: import one CSS file and it looks finished, on any page. Theme it with CSS variables.

## Install

It isn’t published on npm yet. To try it, build and pack it in this repository:

```sh
pnpm install
pnpm build
pnpm pack
```

Then install the packed file in your project:

```sh
pnpm add ./path/to/accessible-combobox-react-<version>.tgz
```

```tsx
import { Combobox } from "accessible-combobox-react";
import "accessible-combobox-react/styles.css";

<Combobox label="Country" options={countries} defaultValue="norway" />

<Combobox
  label="Teams to notify"
  selection="multiple"
  options={teams}
  value={notify}
  onValueChange={setNotify}
/>
```

Options are `{ value: string; label: string; disabled?: boolean }`. Selection is tracked by `value`, so options can be recreated on every render.

## Multiple selection

The selection is shown below the input, never inside it:

```
Teams to notify
[ Search…                               ⌄ ]
› 3 selected                Clear selection
```

- **The count is written in words:** "3 selected", not "3".
- **"3 selected" is a button** that expands into a list of the selected options, each with its own "Remove …" button. It stays collapsed by default, so a large selection still takes one line. Set `defaultSelectedExpanded` to start it expanded. After that, only the user opens or closes it.
- **"Clear selection" is a labeled text button,** kept away from the input's own buttons.
- **With nothing selected, the row is not shown.**
- **Focus is never lost.** Removing an option moves focus to the next remove button, then the previous one. Removing the last option, or clearing everything, moves focus to the input.
- **Screen readers hear the count.** It describes the input, so focusing the field reads "Teams to notify, combobox, 3 selected", and changes are announced.

The trade-off is that the selected options are hidden until the list is expanded. The count always says how many there are.

## Styling

`styles.css` draws the whole component, with defaults for every color and size. It resets what it uses itself, so global page styles (such as a CSS framework's reset) don't break it.

**Inherited from the page:** font family, font size and line height, and the color and styling of the label and description. A form field should match the text around it, and the label should match the page's other labels.

**Theming:** set any of these variables on the combobox, a wrapper or `:root`:

| Variable                          | Default                                    |
| --------------------------------- | ------------------------------------------ |
| `--combobox-color-text`           | Near black, near white in dark mode        |
| `--combobox-color-muted`          | Gray, for secondary text and icons         |
| `--combobox-color-border`         | The muted color, for the input's border    |
| `--combobox-color-rule`           | Light gray, for the popup and list borders |
| `--combobox-color-background`     | Near white, near black in dark mode        |
| `--combobox-color-surface`        | A tint of the background, for the list     |
| `--combobox-color-accent`         | Blue, for focus, selection and checkboxes  |
| `--combobox-color-on-accent`      | The background color, for checkmarks       |
| `--combobox-space`                | `1rem`. Smaller spaces are derived from it |
| `--combobox-radius`               | `0.375rem`                                 |
| `--combobox-border-width`         | `0.0625rem`                                |
| `--combobox-focus-width`          | `0.1875rem`                                |
| `--combobox-control-size`         | `2.75rem`, the minimum size of buttons     |
| `--combobox-icon-size`            | `1.25rem`                                  |
| `--combobox-max-inline-size`      | `24rem`                                    |
| `--combobox-popup-max-block-size` | `20rem`                                    |
| `--combobox-shadow`               | A soft shadow under the popup              |
| `--combobox-label-font-weight`    | Inherited from the page                    |

```css
:root {
  --combobox-color-accent: oklch(45% 0.13 150deg);
  --combobox-radius: 1rem;
}
```

The default colors use `light-dark()`, so they follow the page's `color-scheme`.

**Cascade layers:** the CSS is not in a layer, so unlayered page styles can't override it by accident. If your site uses layers, import it into one:

```css
@import url("accessible-combobox-react/styles.css") layer(components);
```

Variables starting with `--_` are internal and may change between versions.

## Props

| Prop                                                      | Description                                                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `label`                                                   | Required. Names the input and the listbox.                                                         |
| `hideLabel`                                               | Hides the label visually but keeps it for screen readers.                                          |
| `description`                                             | Hint text below the label, linked with `aria-describedby`.                                         |
| `options`                                                 | The options. Must include the selected options, so their labels can be shown.                      |
| `selection`                                               | `"single"` (default) or `"multiple"`.                                                              |
| `value` / `defaultValue` / `onValueChange`                | `string \| null` in single mode, `string[]` in multiple mode. Pass `value` to control it.          |
| `defaultSelectedExpanded`                                 | Multiple mode. Whether the list of selected options starts expanded. Default `false`.              |
| `inputValue` / `defaultInputValue` / `onInputValueChange` | The search text. Each prop works without the others.                                               |
| `open` / `defaultOpen` / `onOpenChange`                   | The popup state.                                                                                   |
| `filter`                                                  | `(option, query) => boolean`. The default ignores case and accents. Use `false` to filter outside. |
| `inline`                                                  | Shows the listbox below the input all the time instead of in a popup.                              |
| `name`                                                    | Adds hidden inputs so the value is submitted with a native form: one entry per value.              |
| `required`                                                | Blocks form submission while nothing is selected.                                                  |
| `disabled`, `placeholder`, `id`, `className`, `ref`       | Passed to the input or the root element. `ref` points to the input.                                |
| `messages`                                                | Overrides any visible or announced text, for translation. See `defaultMessages`.                   |
| `renderOption`                                            | `(option, { selected, active, disabled }) => ReactNode` for custom option content.                 |

In single mode, the input shows the selected option's label until the user starts typing. When focus leaves the component, or the user presses Escape, an unfinished search is thrown away and the label is shown again.

When `disabled`, the list of selected options can still be expanded to review it, but nothing can be changed.

## Keyboard

| Key                 | Action                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| ArrowDown / ArrowUp | Opens the popup, or moves through the options. Starts from the selected option. Doesn't wrap around. |
| Alt+ArrowDown       | Opens the popup without moving to an option.                                                         |
| Alt+ArrowUp         | Closes the popup.                                                                                    |
| Home / End          | Moves to the first or last option while an option is active. Otherwise it moves the text cursor.     |
| PageDown / PageUp   | Moves 10 options.                                                                                    |
| Enter               | Selects the active option. When the popup is closed, Enter submits the form as usual.                |
| Escape              | Closes the popup. It never clears the input.                                                         |
| Tab                 | Moves on as usual. Leaving the input closes the popup, so it never covers the selection summary.     |

Disabled options are skipped. In multiple mode the popup stays open after selecting and the search text clears.

## Structure

```
src/Combobox/
  Combobox.tsx                      composes the parts below
  hooks/useCombobox.ts              state, keyboard handling and ARIA attributes
  hooks/useControllableState.ts     controlled or uncontrolled state with one code path
  hooks/useAnchorPosition.ts        positioning for browsers without CSS anchor positioning
  hooks/useAnnouncer.ts             live-region messages
  hooks/useSupportsPopover.ts
  ComboboxField/                    input box
    FieldButton/                    clear and toggle buttons
  ComboboxListbox/                  popup and listbox
    ComboboxOption/
  ComboboxSelected/                 "3 selected" summary and Clear selection
    SelectedList/                   expandable list with remove buttons
  LiveRegion/, VisuallyHidden/, Icon/
  navigation.ts, filter.ts, messages.ts, types.ts
```

Each component has its own folder with a `.tsx` and a `.css` file.

## Design decisions

- **Focus stays in the input** while the user picks options. Options are reached with `aria-activedescendant`. Pressing a button or the popup with the mouse doesn't move focus, so no blur timers are needed. One `focusout` handler on the root element closes the popup when focus leaves the input area.
- **No positioning library.** The popup uses `popover="manual"` so it sits above everything else, and CSS anchor positioning places it under the input. It flips above the input when there's no room below. In browsers without anchor positioning, a small hook measures the input and sets the position. In browsers without the Popover API, the popup uses `position: fixed`.
- **IDs come from `useId`**, so option IDs are unique on any page and valid whatever the option values contain. `aria-activedescendant` is only set while an option is active and the popup is open.
- **Announcements** go to a polite live region: selecting, deselecting, clearing everything, and the number of results after typing stops. Each message replaces the region's content, so repeating the same message is still announced.
- **Native forms work:** hidden inputs carry the value, `required` uses `setCustomValidity`, and resetting the form restores the default value.

## Develop

Requires Node.js 26.13.0 or newer and pnpm 12.

```sh
pnpm install
pnpm dev           # demo at http://localhost:5173
pnpm format        # Prettier
pnpm lint          # ESLint (TypeScript, React Hooks, jsx-a11y) and Stylelint
pnpm typecheck
pnpm test          # Vitest + Testing Library
pnpm build         # library build to dist/
pnpm verify        # all of the above
```

## Publishing

`package.json` is marked `"private": true` while the package is experimental, so it can’t be published by accident. Remove that line before the first release. `pnpm publish` runs `pnpm verify` first, through `prepublishOnly`. Check the package contents with `pnpm pack --dry-run` before publishing.

## License

MIT
