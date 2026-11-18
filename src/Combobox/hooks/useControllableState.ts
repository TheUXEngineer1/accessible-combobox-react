import { useCallback, useState } from "react";

interface ControllableStateOptions<T> {
  value: T | undefined;
  defaultValue: T;
  onChange: ((value: T) => void) | undefined;
}

/**
 * State that is owned by the parent when `value` is defined and by the
 * component otherwise. `onChange` is called in both cases.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<T>) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [currentValue, setValue] as const;
}
