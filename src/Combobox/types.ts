import type { ReactNode, Ref } from "react";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectionMode = "single" | "multiple";

export type ComboboxFilter = (option: ComboboxOption, query: string) => boolean;

export interface ComboboxOptionState {
  selected: boolean;
  active: boolean;
  disabled: boolean;
}

export interface ComboboxMessages {
  noResults: string;
  clearInput: string;
  toggle: string;
  multipleHint: string;
  required: string;
  selectionCleared: string;
  selected: (label: string) => string;
  deselected: (label: string) => string;
  selectedCount: (count: number) => string;
  clearSelection: string;
  removeItem: (label: string) => string;
  selectedListLabel: (label: string) => string;
  results: (count: number) => string;
}

interface ComboboxBaseProps {
  /** Visible label. Always required so the input has an accessible name. */
  label: string;
  hideLabel?: boolean;
  description?: string;
  /** Must include the currently selected options. */
  options: readonly ComboboxOption[];
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Pass `false` to show `options` unfiltered, for example when filtering on a server. */
  filter?: ComboboxFilter | false;
  /** Always show the listbox below the input instead of in a popup. */
  inline?: boolean;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
  messages?: Partial<ComboboxMessages>;
  renderOption?: (
    option: ComboboxOption,
    state: ComboboxOptionState,
  ) => ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export interface SingleComboboxProps extends ComboboxBaseProps {
  selection?: "single";
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

export interface MultipleComboboxProps extends ComboboxBaseProps {
  selection: "multiple";
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  /** Whether the list of selected options starts expanded. After that, only the user opens or closes it. */
  defaultSelectedExpanded?: boolean;
}

export type ComboboxProps = SingleComboboxProps | MultipleComboboxProps;
