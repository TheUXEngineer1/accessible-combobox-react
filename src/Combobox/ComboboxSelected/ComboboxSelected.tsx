import { Icon } from "../Icon/Icon";
import type { ComboboxMessages, ComboboxOption } from "../types";
import { SelectedList } from "./SelectedList/SelectedList";
import "./ComboboxSelected.css";

interface ComboboxSelectedProps {
  /** Referenced by the input's aria-describedby, so it reads the count. */
  summaryId: string;
  listId: string;
  label: string;
  options: readonly ComboboxOption[];
  expanded: boolean;
  disabled: boolean;
  messages: ComboboxMessages;
  onToggle: () => void;
  onClear: () => void;
  onRemove: (option: ComboboxOption) => void;
  /** Called when the last option is removed, so focus can return to the input. */
  onEmpty: () => void;
}

/**
 * The selection written out as "3 selected", which expands into a list of the
 * selected options, plus a labeled button that clears them all.
 */
export function ComboboxSelected({
  summaryId,
  listId,
  label,
  options,
  expanded,
  disabled,
  messages,
  onToggle,
  onClear,
  onRemove,
  onEmpty,
}: ComboboxSelectedProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="combobox-selected">
      <div className="combobox-selected-summary">
        {/* Stays enabled when the combobox is disabled, so the selection can still be reviewed. */}
        <button
          type="button"
          id={summaryId}
          className="combobox-selected-toggle"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={onToggle}
        >
          <Icon name={expanded ? "chevron" : "chevronEnd"} />
          {messages.selectedCount(options.length)}
        </button>
        <button
          type="button"
          className="combobox-selected-clear"
          disabled={disabled}
          onClick={onClear}
        >
          {messages.clearSelection}
        </button>
      </div>
      <SelectedList
        id={listId}
        label={messages.selectedListLabel(label)}
        options={options}
        hidden={!expanded}
        disabled={disabled}
        removeLabel={messages.removeItem}
        onRemove={onRemove}
        onEmpty={onEmpty}
      />
    </div>
  );
}
