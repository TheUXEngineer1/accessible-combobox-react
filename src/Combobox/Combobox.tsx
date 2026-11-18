import { useRef } from "react";
import { ComboboxField } from "./ComboboxField/ComboboxField";
import { ComboboxListbox } from "./ComboboxListbox/ComboboxListbox";
import { ComboboxSelected } from "./ComboboxSelected/ComboboxSelected";
import { useCombobox } from "./hooks/useCombobox";
import { LiveRegion } from "./LiveRegion/LiveRegion";
import type { ComboboxProps } from "./types";
import { VisuallyHidden } from "./VisuallyHidden/VisuallyHidden";
import "./Combobox.css";

export function Combobox(props: ComboboxProps) {
  const { label, hideLabel, description, name, className, renderOption } =
    props;
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const combobox = useCombobox(props, rootRef, fieldRef);
  const {
    selection,
    multiple,
    inline,
    disabled,
    messages,
    ids,
    selectedValues,
    selectedOptions,
  } = combobox;

  return (
    <div
      ref={rootRef}
      className={className ? `combobox ${className}` : "combobox"}
      data-selection={selection}
      data-inline={inline || undefined}
      onBlur={combobox.handleRootBlur}
    >
      <label id={ids.label} htmlFor={ids.input}>
        {hideLabel ? <VisuallyHidden>{label}</VisuallyHidden> : label}
      </label>
      {description ? (
        <p id={ids.description} className="combobox-description">
          {description}
        </p>
      ) : null}
      {multiple ? (
        <VisuallyHidden id={ids.hint}>{messages.multipleHint}</VisuallyHidden>
      ) : null}

      <ComboboxField
        fieldRef={fieldRef}
        inputProps={combobox.inputProps}
        anchorName={combobox.anchorName}
        listboxId={ids.listbox}
        messages={messages}
        disabled={disabled}
        expanded={combobox.expanded}
        showToggle={!inline}
        showClear={combobox.displayValue !== ""}
        onClearInput={combobox.clearInput}
        onToggle={combobox.handleToggle}
      />

      {multiple ? (
        <ComboboxSelected
          summaryId={ids.summary}
          listId={ids.selectedList}
          label={label}
          options={selectedOptions}
          expanded={combobox.selectedExpanded}
          disabled={disabled}
          messages={messages}
          onToggle={combobox.toggleSelectedExpanded}
          onClear={combobox.clearSelection}
          onRemove={combobox.deselect}
          onEmpty={combobox.focusInput}
        />
      ) : null}

      <ComboboxListbox
        id={ids.listbox}
        labelledBy={ids.label}
        options={combobox.visibleOptions}
        activeIndex={combobox.activeIndex}
        getOptionId={combobox.getOptionId}
        isSelected={combobox.isSelected}
        onSelect={combobox.select}
        multiple={multiple}
        expanded={combobox.expanded}
        inline={inline}
        anchorName={combobox.anchorName}
        anchorRef={fieldRef}
        noResultsText={messages.noResults}
        renderOption={renderOption}
      />

      {name
        ? (multiple ? selectedValues : [selectedValues[0] ?? ""]).map(
            (value) => (
              <input
                key={value}
                type="hidden"
                name={name}
                value={value}
                disabled={disabled}
              />
            ),
          )
        : null}

      <LiveRegion announcement={combobox.announcement} />
    </div>
  );
}
