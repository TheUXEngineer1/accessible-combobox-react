export type Direction =
  "first" | "last" | "next" | "previous" | "pageDown" | "pageUp";

export const pageSize = 10;

interface Navigable {
  disabled?: boolean;
}

function scan(
  options: readonly Navigable[],
  from: number,
  step: 1 | -1,
): number {
  for (let index = from; index >= 0 && index < options.length; index += step) {
    if (!options[index]?.disabled) {
      return index;
    }
  }
  return -1;
}

/**
 * Returns the index of the enabled option to activate, or -1 if there is none.
 * Navigation stops at either end instead of wrapping.
 */
export function moveActiveIndex(
  options: readonly Navigable[],
  current: number,
  direction: Direction,
): number {
  const last = options.length - 1;
  const hasCurrent = current >= 0 && current <= last;
  const orCurrent = (index: number) => (index === -1 ? current : index);

  switch (direction) {
    case "first":
      return scan(options, 0, 1);
    case "last":
      return scan(options, last, -1);
    case "next":
      return hasCurrent
        ? orCurrent(scan(options, current + 1, 1))
        : scan(options, 0, 1);
    case "previous":
      return hasCurrent
        ? orCurrent(scan(options, current - 1, -1))
        : scan(options, last, -1);
    case "pageDown": {
      if (!hasCurrent) {
        return scan(options, 0, 1);
      }
      const target = Math.min(current + pageSize, last);
      const forward = scan(options, target, 1);
      return forward === -1 ? orCurrent(scan(options, target, -1)) : forward;
    }
    case "pageUp": {
      if (!hasCurrent) {
        return scan(options, last, -1);
      }
      const target = Math.max(current - pageSize, 0);
      const backward = scan(options, target, -1);
      return backward === -1 ? orCurrent(scan(options, target, 1)) : backward;
    }
  }
}
