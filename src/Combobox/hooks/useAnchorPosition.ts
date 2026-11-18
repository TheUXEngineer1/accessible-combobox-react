import { useLayoutEffect } from "react";
import type { RefObject } from "react";

function supportsAnchorPositioning(): boolean {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("anchor-name: --combobox")
  );
}

/**
 * Fallback for browsers without CSS anchor positioning: measures the anchor
 * and exposes the popup position as custom properties, flipping above the
 * anchor when there is more room there.
 */
export function useAnchorPosition(
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!enabled || !anchor || !floating || supportsAnchorPositioning()) {
      return;
    }

    const update = () => {
      const rect = anchor.getBoundingClientRect();
      const root = document.documentElement;
      const gap = parseFloat(getComputedStyle(root).fontSize) / 4;
      const isRtl = getComputedStyle(anchor).direction === "rtl";
      const height = floating.offsetHeight;
      const spaceBelow = root.clientHeight - rect.bottom - gap;
      const placeAbove = spaceBelow < height && rect.top > spaceBelow;
      const blockStart = placeAbove
        ? Math.max(rect.top - height - gap, 0)
        : rect.bottom + gap;
      const inlineStart = isRtl ? root.clientWidth - rect.right : rect.left;

      floating.style.setProperty("--_popup-block-start", `${blockStart}px`);
      floating.style.setProperty("--_popup-inline-start", `${inlineStart}px`);
      floating.style.setProperty("--_popup-inline-size", `${rect.width}px`);
    };

    update();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(update);
    resizeObserver?.observe(anchor);
    resizeObserver?.observe(floating);
    window.addEventListener("scroll", update, { capture: true, passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }, [anchorRef, floatingRef, enabled]);
}
