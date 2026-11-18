import type { ReactNode } from "react";
import { Icon } from "../../Icon/Icon";
import type {
  ComboboxOption as Option,
  ComboboxOptionState,
} from "../../types";
import "./ComboboxOption.css";

interface ComboboxOptionProps {
  id: string;
  option: Option;
  selected: boolean;
  active: boolean;
  multiple: boolean;
  onSelect: (option: Option) => void;
  renderOption?: (option: Option, state: ComboboxOptionState) => ReactNode;
}

export function ComboboxOption({
  id,
  option,
  selected,
  active,
  multiple,
  onSelect,
  renderOption,
}: ComboboxOptionProps) {
  const disabled = Boolean(option.disabled);

  return (
    // Keyboard users interact through the input via aria-activedescendant, so
    // options are intentionally not focusable and have no key handlers.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <li
      id={id}
      role="option"
      className="combobox-option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-active={active || undefined}
      data-multiple={multiple || undefined}
      onClick={() => onSelect(option)}
    >
      <span className="combobox-option-indicator">
        {selected ? <Icon name="check" /> : null}
      </span>
      <span className="combobox-option-label">
        {renderOption
          ? renderOption(option, { selected, active, disabled })
          : option.label}
      </span>
    </li>
  );
}
