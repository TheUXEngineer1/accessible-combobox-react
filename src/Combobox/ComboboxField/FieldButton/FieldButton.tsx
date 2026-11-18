import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { Icon } from "../../Icon/Icon";
import type { IconName } from "../../Icon/Icon";
import "./FieldButton.css";

interface FieldButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
> {
  icon: IconName;
  label: string;
}

/** Keeps focus in the input when pressed with a pointer. */
function keepInputFocus(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

export function FieldButton({ icon, label, ...props }: FieldButtonProps) {
  return (
    <button
      {...props}
      type="button"
      className="combobox-field-button"
      aria-label={label}
      onMouseDown={keepInputFocus}
    >
      <Icon name={icon} />
    </button>
  );
}
