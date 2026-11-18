import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const getSnapshot = () =>
  typeof HTMLElement !== "undefined" &&
  typeof HTMLElement.prototype.showPopover === "function";

// Assume support on the server; browsers without it re-render after hydration.
const getServerSnapshot = () => true;

export function useSupportsPopover(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
