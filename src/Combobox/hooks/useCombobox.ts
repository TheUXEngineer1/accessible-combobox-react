import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  Ref,
  RefCallback,
  RefObject,
} from "react";
import { defaultFilter } from "../filter";
import { resolveMessages } from "../messages";
import { moveActiveIndex } from "../navigation";
import type { Direction } from "../navigation";
import type {
  ComboboxOption,
  ComboboxProps,
  MultipleComboboxProps,
  SelectionMode,
} from "../types";
import { useAnnouncer } from "./useAnnouncer";
import { useControllableState } from "./useControllableState";

const resultsAnnouncementDelay = 500;

const emptyValues: readonly string[] = [];

function toValues(
  value: string | null | readonly string[] | undefined,
): readonly string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return emptyValues;
  }
  return typeof value === "string" ? [value] : value;
}

function isMultiple(props: ComboboxProps): props is MultipleComboboxProps {
  return props.selection === "multiple";
}

function notifyValueChange(props: ComboboxProps, values: readonly string[]) {
  if (isMultiple(props)) {
    props.onValueChange?.([...values]);
  } else {
    props.onValueChange?.(values[0] ?? null);
  }
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") {
    return ref(node);
  }
  if (ref) {
    ref.current = node;
  }
}

export function useCombobox(
  props: ComboboxProps,
  rootRef: RefObject<HTMLDivElement | null>,
  fieldRef: RefObject<HTMLDivElement | null>,
) {
  const {
    options,
    inline = false,
    disabled = false,
    required = false,
    filter = defaultFilter,
    placeholder,
    ref,
  } = props;
  const selection: SelectionMode = props.selection ?? "single";
  const multiple = selection !== "single";
  const messages = resolveMessages(props.messages);
  const { announcement, announce } = useAnnouncer();

  const baseId = useId();
  const ids = {
    input: props.id ?? `${baseId}-input`,
    label: `${baseId}-label`,
    listbox: `${baseId}-listbox`,
    description: `${baseId}-description`,
    hint: `${baseId}-hint`,
    summary: `${baseId}-summary`,
    selectedList: `${baseId}-selected`,
  };
  const getOptionId = (index: number) => `${ids.listbox}-option-${index}`;
  const anchorName = `--combobox${baseId.replace(/[^\w-]/g, "")}`;

  const inputRef = useRef<HTMLInputElement>(null);

  const setInputRef: RefCallback<HTMLInputElement> = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      return assignRef(ref, node);
    },
    [ref],
  );

  const focusInput = () => inputRef.current?.focus();

  // Values

  const [initialValues] = useState(
    () => toValues(props.defaultValue) ?? emptyValues,
  );
  const [selectedValues, setSelectedValues] = useControllableState<
    readonly string[]
  >({
    value: toValues(props.value),
    defaultValue: initialValues,
    onChange: (next) => notifyValueChange(props, next),
  });

  const selectedOptions = useMemo(
    () =>
      selectedValues.flatMap((value) => {
        const option = options.find((candidate) => candidate.value === value);
        return option ? [option] : [];
      }),
    [options, selectedValues],
  );
  const selectedLabel = multiple ? "" : (selectedOptions[0]?.label ?? "");
  const hasSummary = multiple && selectedOptions.length > 0;

  // Only the user opens or closes the list of selected options. It keeps its
  // state while the selection is empty and the list is not shown.
  const [selectedExpanded, setSelectedExpanded] = useState(
    () => isMultiple(props) && Boolean(props.defaultSelectedExpanded),
  );
  const toggleSelectedExpanded = () => setSelectedExpanded((value) => !value);
  const isSelected = (option: ComboboxOption) =>
    selectedValues.includes(option.value);

  // Input text

  const [inputValue, setInputValue] = useControllableState<string>({
    value: props.inputValue,
    defaultValue: props.defaultInputValue ?? "",
    onChange: props.onInputValueChange,
  });
  // In single mode the input shows the selected label until the user edits it.
  const [isSearching, setIsSearching] = useState(
    () => !multiple && Boolean(props.inputValue ?? props.defaultInputValue),
  );
  const displayValue = !multiple && !isSearching ? selectedLabel : inputValue;

  // Popup

  const [openState, setOpenState] = useControllableState<boolean>({
    value: props.open,
    defaultValue: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
  });
  const expanded = inline || (openState && !disabled);
  const setOpen = (next: boolean) => {
    if (!inline && next !== openState) {
      setOpenState(next);
    }
  };

  // Options

  const filterOption = filter === false ? null : filter;
  const shouldFilter =
    filterOption !== null &&
    inputValue.trim() !== "" &&
    (multiple || isSearching);
  const visibleOptions = useMemo(
    () =>
      shouldFilter && filterOption
        ? options.filter((option) => filterOption(option, inputValue))
        : options,
    [filterOption, inputValue, options, shouldFilter],
  );

  const [activeValue, setActiveValue] = useState<string | null>(null);
  const activeIndex =
    expanded && activeValue !== null
      ? visibleOptions.findIndex(
          (option) => option.value === activeValue && !option.disabled,
        )
      : -1;
  const activeOption = visibleOptions[activeIndex];

  const activate = (index: number) =>
    setActiveValue(visibleOptions[index]?.value ?? null);

  const move = (direction: Direction) =>
    activate(moveActiveIndex(visibleOptions, activeIndex, direction));

  const getInitialIndex = (direction: "first" | "last") => {
    const selectedIndex = visibleOptions.findIndex(
      (option) => !option.disabled && isSelected(option),
    );
    return selectedIndex === -1
      ? moveActiveIndex(visibleOptions, -1, direction)
      : selectedIndex;
  };

  const close = () => {
    setOpen(false);
    setActiveValue(null);
  };

  /** Closes the popup and throws away an unfinished search in single mode. */
  const dismiss = () => {
    close();
    if (!multiple && isSearching) {
      setIsSearching(false);
      if (inputValue !== selectedLabel) {
        setInputValue(selectedLabel);
      }
    }
  };

  // Selection

  const select = (option: ComboboxOption) => {
    if (disabled || option.disabled) {
      return;
    }

    if (!multiple) {
      if (!isSelected(option)) {
        setSelectedValues([option.value]);
        announce(messages.selected(option.label));
      }
      setIsSearching(false);
      if (inputValue !== option.label) {
        setInputValue(option.label);
      }
      close();
      return;
    }

    if (isSelected(option)) {
      setSelectedValues(
        selectedValues.filter((value) => value !== option.value),
      );
      announce(messages.deselected(option.label));
    } else {
      setSelectedValues([...selectedValues, option.value]);
      announce(messages.selected(option.label));
    }
    setActiveValue(option.value);
    if (inputValue !== "") {
      setInputValue("");
    }
  };

  const deselect = (option: ComboboxOption) => {
    if (disabled) {
      return;
    }
    setSelectedValues(selectedValues.filter((value) => value !== option.value));
    announce(messages.deselected(option.label));
  };

  const clearSelection = () => {
    if (disabled) {
      return;
    }
    setSelectedValues(emptyValues);
    announce(messages.selectionCleared);
    focusInput();
  };

  const clearInput = () => {
    if (disabled) {
      return;
    }
    if (!multiple) {
      const [selectedOption] = selectedOptions;
      if (selectedOption) {
        setSelectedValues(emptyValues);
        announce(messages.deselected(selectedOption.label));
      }
      setIsSearching(false);
    }
    setInputValue("");
    setActiveValue(null);
    focusInput();
  };

  // Event handlers

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setInputValue(next);
    setOpen(true);
    if (multiple) {
      return;
    }
    setIsSearching(true);
    const [selectedOption] = selectedOptions;
    if (next === "" && selectedOption) {
      setSelectedValues(emptyValues);
      announce(messages.deselected(selectedOption.label));
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || event.nativeEvent.isComposing) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        const down = event.key === "ArrowDown";
        if (!expanded) {
          setOpen(true);
          if (!event.altKey) {
            activate(getInitialIndex(down ? "first" : "last"));
          }
        } else if (event.altKey) {
          if (!down) {
            dismiss();
          }
        } else if (activeIndex === -1) {
          activate(getInitialIndex(down ? "first" : "last"));
        } else {
          move(down ? "next" : "previous");
        }
        return;
      }
      case "Home":
      case "End":
        // With no active option, Home and End move the text cursor instead.
        if (activeOption) {
          event.preventDefault();
          move(event.key === "Home" ? "first" : "last");
        }
        return;
      case "PageDown":
      case "PageUp":
        if (expanded && visibleOptions.length > 0) {
          event.preventDefault();
          move(event.key === "PageDown" ? "pageDown" : "pageUp");
        }
        return;
      case "Enter":
        if (activeOption) {
          event.preventDefault();
          select(activeOption);
        } else if (expanded && !inline) {
          // Leave Enter alone when closed so it can submit the form.
          event.preventDefault();
          dismiss();
        }
        return;
      case "Escape":
        if (expanded && !inline) {
          event.preventDefault();
          dismiss();
        } else if (inline) {
          setActiveValue(null);
        }
        return;
    }
  };

  const handleInputClick = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    focusInput();
    if (expanded) {
      dismiss();
    } else {
      setOpen(true);
    }
  };

  /**
   * Focus leaving the input area closes the popup, so it never covers the
   * selection summary below. Leaving the whole component also clears an
   * unfinished search in multiple mode.
   */
  const handleRootBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next =
      event.relatedTarget instanceof Node ? event.relatedTarget : null;
    if (next && fieldRef.current?.contains(next)) {
      return;
    }
    dismiss();
    const leftComponent = !next || !rootRef.current?.contains(next);
    if (leftComponent && multiple && inputValue !== "") {
      setInputValue("");
    }
  };

  // Side effects

  const announceResults = useEffectEvent((count: number) => {
    announce(messages.results(count));
  });
  const resultCount = visibleOptions.length;
  useEffect(() => {
    if (!expanded || !shouldFilter) {
      return;
    }
    const timer = setTimeout(
      () => announceResults(resultCount),
      resultsAnnouncementDelay,
    );
    return () => clearTimeout(timer);
  }, [expanded, shouldFilter, inputValue, resultCount]);

  useEffect(() => {
    inputRef.current?.setCustomValidity(
      required && selectedValues.length === 0 ? messages.required : "",
    );
  }, [required, selectedValues.length, messages.required]);

  const resetToDefaults = useEffectEvent(() => {
    setSelectedValues(initialValues);
    setIsSearching(false);
    setInputValue(props.defaultInputValue ?? "");
    close();
  });
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) {
      return;
    }
    const handleReset = () => resetToDefaults();
    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, []);

  const describedBy =
    [
      props.description ? ids.description : "",
      multiple ? ids.hint : "",
      hasSummary ? ids.summary : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const inputProps = {
    ref: setInputRef,
    id: ids.input,
    type: "text",
    role: "combobox",
    value: displayValue,
    placeholder,
    disabled,
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
    "aria-autocomplete": "list",
    "aria-expanded": expanded,
    "aria-controls": ids.listbox,
    "aria-activedescendant":
      activeIndex === -1 ? undefined : getOptionId(activeIndex),
    "aria-describedby": describedBy,
    "aria-required": required || undefined,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onClick: handleInputClick,
  } satisfies InputHTMLAttributes<HTMLInputElement> & {
    ref: RefCallback<HTMLInputElement>;
  };

  return {
    selection,
    multiple,
    inline,
    disabled,
    messages,
    ids,
    anchorName,
    getOptionId,
    inputProps,
    displayValue,
    expanded,
    visibleOptions,
    activeIndex,
    selectedValues,
    selectedOptions,
    hasSummary,
    selectedExpanded,
    toggleSelectedExpanded,
    isSelected,
    announcement,
    select,
    deselect,
    clearSelection,
    clearInput,
    focusInput,
    handleToggle,
    handleRootBlur,
  };
}
