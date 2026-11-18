import type { ReactNode } from "react";
import "./VisuallyHidden.css";

export function VisuallyHidden({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <span className="combobox-visually-hidden" id={id}>
      {children}
    </span>
  );
}
