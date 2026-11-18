import { useRef } from "react";
import { Icon } from "../../Icon/Icon";
import type { ComboboxOption } from "../../types";
import "./SelectedList.css";

interface SelectedListProps {
  id: string;
  label: string;
  options: readonly ComboboxOption[];
  hidden: boolean;
  disabled: boolean;
  removeLabel: (label: string) => string;
  onRemove: (option: ComboboxOption) => void;
  onEmpty: () => void;
}

export function SelectedList({
  id,
  label,
  options,
  hidden,
  disabled,
  removeLabel,
  onRemove,
  onEmpty,
}: SelectedListProps) {
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());

  // Move focus before the removed button disappears, so it is never lost.
  const remove = (option: ComboboxOption, index: number) => {
    const neighbor = options[index + 1] ?? options[index - 1];
    const button = neighbor && buttonRefs.current.get(neighbor.value);
    if (button) {
      button.focus();
    } else {
      onEmpty();
    }
    onRemove(option);
  };

  return (
    <ul
      className="combobox-selected-list"
      id={id}
      aria-label={label}
      hidden={hidden}
    >
      {options.map((option, index) => (
        <li key={option.value}>
          <span>{option.label}</span>
          <button
            type="button"
            ref={(node) => {
              if (node) {
                buttonRefs.current.set(option.value, node);
              }
              return () => {
                buttonRefs.current.delete(option.value);
              };
            }}
            aria-label={removeLabel(option.label)}
            disabled={disabled}
            onClick={() => remove(option, index)}
          >
            <Icon name="close" />
          </button>
        </li>
      ))}
    </ul>
  );
}
