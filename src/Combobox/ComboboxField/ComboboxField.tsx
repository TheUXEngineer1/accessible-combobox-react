import type { CSSProperties, InputHTMLAttributes, Ref, RefObject } from "react";
import type { ComboboxMessages } from "../types";
import { FieldButton } from "./FieldButton/FieldButton";
import "./ComboboxField.css";

interface ComboboxFieldProps {
  fieldRef: RefObject<HTMLDivElement | null>;
  inputProps: InputHTMLAttributes<HTMLInputElement> & {
    ref: Ref<HTMLInputElement>;
  };
  anchorName: string;
  listboxId: string;
  messages: ComboboxMessages;
  disabled: boolean;
  expanded: boolean;
  showToggle: boolean;
  showClear: boolean;
  onClearInput: () => void;
  onToggle: () => void;
}

export function ComboboxField({
  fieldRef,
  inputProps,
  anchorName,
  listboxId,
  messages,
  disabled,
  expanded,
  showToggle,
  showClear,
  onClearInput,
  onToggle,
}: ComboboxFieldProps) {
  return (
    <div
      ref={fieldRef}
      className="combobox-field"
      data-disabled={disabled || undefined}
      style={{ "--_anchor": anchorName } as CSSProperties}
    >
      <input {...inputProps} />
      {showClear ? (
        <FieldButton
          icon="close"
          label={messages.clearInput}
          disabled={disabled}
          onClick={onClearInput}
        />
      ) : null}
      {showToggle ? (
        <FieldButton
          icon="chevron"
          label={messages.toggle}
          tabIndex={-1}
          aria-expanded={expanded}
          aria-controls={listboxId}
          disabled={disabled}
          onClick={onToggle}
        />
      ) : null}
    </div>
  );
}
