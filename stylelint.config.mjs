import stylelintRules from "./stylelint.rules.mjs";

/** @type {import("stylelint").Config} */
const config = {
  extends: ["stylelint-config-standard"],
  plugins: stylelintRules,
  ignoreFiles: ["dist/**", "node_modules/**"],
  rules: {
    "combobox/rem-only": true,
    "combobox/min-font-size": true,
    "combobox/logical-properties": true,
    "combobox/preference-media-only": true,
    "combobox/no-nesting-selector-in-scope": true,
    "declaration-no-important": true,
    "selector-max-id": 0,
    // --combobox-* is the public theming API; --_* marks private variables.
    "custom-property-pattern": [
      "^_?[a-z][a-z0-9]*(-[a-z0-9]+)*$",
      {
        message: (name) =>
          `Expected "${name}" to be kebab-case, optionally starting with _ for private variables`,
      },
    ],
  },
};

export default config;
