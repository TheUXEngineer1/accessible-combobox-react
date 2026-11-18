import { useLayoutEffect, useRef } from "react";
import type { CSSProperties, MouseEvent, ReactNode, RefObject } from "react";
import { useAnchorPosition } from "../hooks/useAnchorPosition";
import { useSupportsPopover } from "../hooks/useSupportsPopover";
import type { ComboboxOption as Option, ComboboxOptionState } from "../types";
import { ComboboxOption } from "./ComboboxOption/ComboboxOption";
import "./ComboboxListbox.css";

interface ComboboxListboxProps {
  id: string;
  labelledBy: string;
  options: readonly Option[];
  activeIndex: number;
  getOptionId: (index: number) => string;
  isSelected: (option: Option) => boolean;
  onSelect: (option: Option) => void;
  multiple: boolean;
  expanded: boolean;
  inline: boolean;
  anchorName: string;
  anchorRef: RefObject<HTMLElement | null>;
  noResultsText: string;
  renderOption?: (option: Option, state: ComboboxOptionState) => ReactNode;
}

/** Keeps focus in the input when the popup is clicked, including its scrollbar. */
function keepInputFocus(event: MouseEvent<HTMLDivElement>) {
  event.preventDefault();
}

function scrollWithin(container: HTMLElement, element: Element) {
  const bounds = container.getBoundingClientRect();
  const target = element.getBoundingClientRect();
  if (target.top < bounds.top) {
    container.scrollTop -= bounds.top - target.top;
  } else if (target.bottom > bounds.bottom) {
    container.scrollTop += target.bottom - bounds.bottom;
  }
}

export function ComboboxListbox({
  id,
  labelledBy,
  options,
  activeIndex,
  getOptionId,
  isSelected,
  onSelect,
  multiple,
  expanded,
  inline,
  anchorName,
  anchorRef,
  noResultsText,
  renderOption,
}: ComboboxListboxProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const isPopup = !inline;
  const supportsPopover = useSupportsPopover();
  const isTopLayer = isPopup && supportsPopover;
  const isEmpty = options.length === 0;

  useLayoutEffect(() => {
    const popup = popupRef.current;
    if (!isTopLayer || !popup) {
      return;
    }
    const isShown = popup.matches(":popover-open");
    if (expanded && !isShown) {
      popup.showPopover();
    } else if (!expanded && isShown) {
      popup.hidePopover();
    }
  }, [expanded, isTopLayer]);

  useAnchorPosition(anchorRef, popupRef, isPopup && expanded);

  // Keep the active option in view without scrolling the page.
  useLayoutEffect(() => {
    const target = listboxRef.current?.children[activeIndex];
    if (expanded && popupRef.current && target) {
      scrollWithin(popupRef.current, target);
    }
  }, [activeIndex, expanded]);

  // Show the selected option when the popup opens.
  useLayoutEffect(() => {
    const target = listboxRef.current?.querySelector('[aria-selected="true"]');
    if (isPopup && expanded && popupRef.current && target) {
      scrollWithin(popupRef.current, target);
    }
  }, [expanded, isPopup]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- only prevents focus loss
    <div
      ref={popupRef}
      className="combobox-popup"
      popover={isTopLayer ? "manual" : undefined}
      hidden={isPopup && !expanded}
      data-popup={isPopup || undefined}
      style={{ "--_anchor": anchorName } as CSSProperties}
      onMouseDown={keepInputFocus}
    >
      <ul
        ref={listboxRef}
        id={id}
        role="listbox"
        aria-labelledby={labelledBy}
        aria-multiselectable={multiple || undefined}
        hidden={isEmpty}
      >
        {options.map((option, index) => (
          <ComboboxOption
            key={option.value}
            id={getOptionId(index)}
            option={option}
            selected={isSelected(option)}
            active={index === activeIndex}
            multiple={multiple}
            onSelect={onSelect}
            renderOption={renderOption}
          />
        ))}
      </ul>
      {isEmpty ? <p className="combobox-empty">{noResultsText}</p> : null}
    </div>
  );
}
