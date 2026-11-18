import stylelint from "stylelint";
import valueParser from "postcss-value-parser";

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const namespace = "combobox";
const pixelsPerRem = 16;

// rem for lengths, vi for fluid sizing inside clamp(); the rest are not lengths.
const allowedUnits = new Set([
  "rem",
  "vi",
  "%",
  "fr",
  "deg",
  "turn",
  "s",
  "ms",
]);

const physicalProperties = new Map([
  ["width", "inline-size"],
  ["height", "block-size"],
  ["min-width", "min-inline-size"],
  ["min-height", "min-block-size"],
  ["max-width", "max-inline-size"],
  ["max-height", "max-block-size"],
  ["top", "inset-block-start"],
  ["bottom", "inset-block-end"],
  ["left", "inset-inline-start"],
  ["right", "inset-inline-end"],
  ["margin-top", "margin-block-start"],
  ["margin-bottom", "margin-block-end"],
  ["margin-left", "margin-inline-start"],
  ["margin-right", "margin-inline-end"],
  ["padding-top", "padding-block-start"],
  ["padding-bottom", "padding-block-end"],
  ["padding-left", "padding-inline-start"],
  ["padding-right", "padding-inline-end"],
  ["border-top", "border-block-start"],
  ["border-bottom", "border-block-end"],
  ["border-left", "border-inline-start"],
  ["border-right", "border-inline-end"],
  ["border-top-width", "border-block-start-width"],
  ["border-bottom-width", "border-block-end-width"],
  ["border-left-width", "border-inline-start-width"],
  ["border-right-width", "border-inline-end-width"],
  ["border-top-style", "border-block-start-style"],
  ["border-bottom-style", "border-block-end-style"],
  ["border-left-style", "border-inline-start-style"],
  ["border-right-style", "border-inline-end-style"],
  ["border-top-color", "border-block-start-color"],
  ["border-bottom-color", "border-block-end-color"],
  ["border-left-color", "border-inline-start-color"],
  ["border-right-color", "border-inline-end-color"],
  ["border-top-left-radius", "border-start-start-radius"],
  ["border-top-right-radius", "border-start-end-radius"],
  ["border-bottom-left-radius", "border-end-start-radius"],
  ["border-bottom-right-radius", "border-end-end-radius"],
  ["overflow-x", "overflow-inline"],
  ["overflow-y", "overflow-block"],
  ["scroll-margin-top", "scroll-margin-block-start"],
  ["scroll-margin-bottom", "scroll-margin-block-end"],
  ["scroll-margin-left", "scroll-margin-inline-start"],
  ["scroll-margin-right", "scroll-margin-inline-end"],
  ["scroll-padding-top", "scroll-padding-block-start"],
  ["scroll-padding-bottom", "scroll-padding-block-end"],
  ["scroll-padding-left", "scroll-padding-inline-start"],
  ["scroll-padding-right", "scroll-padding-inline-end"],
]);

const physicalKeywordProperties = new Set(["text-align", "float", "clear"]);
const physicalKeywords = new Set(["left", "right"]);

const physicalMediaFeature = /\(\s*(?:(?:min|max)-)?(?:width|height)\b/;
const preferenceFeature =
  /^(?:prefers-[a-z-]+|forced-colors|inverted-colors|scripting|hover|any-hover|pointer|any-pointer|color-gamut|dynamic-range)$/;

function isNumber(value) {
  return Number.isFinite(Number(value));
}

function walkDimensions(value, callback) {
  valueParser(value).walk((node) => {
    if (node.type === "function" && node.value === "url") {
      return false;
    }
    if (node.type !== "word") {
      return undefined;
    }
    const dimension = valueParser.unit(node.value);
    if (dimension && dimension.unit && isNumber(dimension.number)) {
      callback(Number(dimension.number), dimension.unit.toLowerCase(), node);
    }
    return undefined;
  });
}

function rule(name, messages, check) {
  const ruleName = `${namespace}/${name}`;
  const ruleFunction = (primary) => (root, result) => {
    if (!validateOptions(result, ruleName, { actual: primary })) {
      return;
    }
    check(
      root,
      (node, message, word) =>
        report({ ruleName, result, node, message, word }),
      ruleFunction.messages,
    );
  };

  ruleFunction.ruleName = ruleName;
  ruleFunction.messages = ruleMessages(ruleName, messages);
  ruleFunction.meta = { url: "./stylelint.rules.mjs" };

  return createPlugin(ruleName, ruleFunction);
}

const remOnly = rule(
  "rem-only",
  {
    unit: (unit) => `Unexpected unit "${unit}". Use rem for lengths.`,
    pixels: (value) =>
      `Expected ${value}rem to equal a whole number of pixels (a multiple of 0.0625rem).`,
  },
  (root, reportIssue, messages) => {
    const check = (node, value) => {
      walkDimensions(value, (number, unit, word) => {
        if (!allowedUnits.has(unit)) {
          reportIssue(node, messages.unit(unit), word.value);
        } else if (
          unit === "rem" &&
          !Number.isInteger(Math.round(number * pixelsPerRem * 1e6) / 1e6)
        ) {
          reportIssue(node, messages.pixels(number), word.value);
        }
      });
    };

    root.walkDecls((decl) => check(decl, decl.value));
    root.walkAtRules(/^(?:media|container)$/i, (atRule) =>
      check(atRule, atRule.params),
    );
  },
);

const minFontSize = rule(
  "min-font-size",
  {
    tooSmall: (value) => `Expected font size ${value} to be at least 1rem.`,
  },
  (root, reportIssue, messages) => {
    root.walkDecls((decl) => {
      const property = decl.prop.toLowerCase();
      if (property !== "font-size" && !property.startsWith("--text-")) {
        return;
      }

      const nodes = valueParser(decl.value).nodes;
      // Only the size itself, or the minimum of clamp(): the middle term of a
      // fluid calculation may legitimately be smaller than 1rem.
      const candidates =
        nodes.length === 1 &&
        nodes[0].type === "function" &&
        nodes[0].value === "clamp"
          ? nodes[0].nodes.slice(0, 1)
          : nodes;

      for (const node of candidates) {
        if (node.type !== "word") {
          continue;
        }
        const dimension = valueParser.unit(node.value);
        if (
          dimension &&
          dimension.unit === "rem" &&
          Number(dimension.number) < 1
        ) {
          reportIssue(decl, messages.tooSmall(node.value), node.value);
        }
      }
    });
  },
);

const logicalProperties = rule(
  "logical-properties",
  {
    property: (physical, logical) =>
      `Unexpected physical property "${physical}". Use "${logical}".`,
    keyword: (property, value) =>
      `Unexpected physical value "${property}: ${value}". Use start or end.`,
    feature: () =>
      "Unexpected physical width or height query. Use inline-size or block-size.",
  },
  (root, reportIssue, messages) => {
    root.walkDecls((decl) => {
      const property = decl.prop.toLowerCase();
      const logical = physicalProperties.get(property);

      if (logical) {
        reportIssue(decl, messages.property(decl.prop, logical), decl.prop);
      } else if (
        physicalKeywordProperties.has(property) &&
        physicalKeywords.has(decl.value.trim().toLowerCase())
      ) {
        reportIssue(decl, messages.keyword(decl.prop, decl.value), decl.value);
      }
    });

    root.walkAtRules(/^(?:media|container)$/i, (atRule) => {
      if (physicalMediaFeature.test(atRule.params)) {
        reportIssue(atRule, messages.feature());
      }
    });
  },
);

const preferenceMediaOnly = rule(
  "preference-media-only",
  {
    feature: (feature) =>
      `Unexpected media feature "${feature}". Use intrinsic layout or container queries; media queries are for user preferences only.`,
  },
  (root, reportIssue, messages) => {
    root.walkAtRules(/^media$/i, (atRule) => {
      for (const [, feature] of atRule.params.matchAll(/\(\s*([a-z-]+)/gi)) {
        if (!preferenceFeature.test(feature.toLowerCase())) {
          reportIssue(atRule, messages.feature(feature), feature);
        }
      }
    });
  },
);

const noNestingSelectorInScope = rule(
  "no-nesting-selector-in-scope",
  {
    rejected: () =>
      'Unexpected "&" directly in @scope. Use ":scope" for the scope root.',
  },
  (root, reportIssue, messages) => {
    root.walkRules((ruleNode) => {
      const parent = ruleNode.parent;
      if (
        parent?.type === "atrule" &&
        parent.name.toLowerCase() === "scope" &&
        ruleNode.selector.includes("&")
      ) {
        reportIssue(ruleNode, messages.rejected(), "&");
      }
    });
  },
);

const stylelintRules = [
  remOnly,
  minFontSize,
  logicalProperties,
  preferenceMediaOnly,
  noNestingSelectorInScope,
];

export default stylelintRules;
