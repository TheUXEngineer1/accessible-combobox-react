import "./Icon.css";

const paths = {
  chevron: "m6 9 6 6 6-6",
  chevronEnd: "m9 6 6 6-6 6",
  check: "M20 6 9 17l-5-5",
  close: "M18 6 6 18M6 6l12 12",
};

export type IconName = keyof typeof paths;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="combobox-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
