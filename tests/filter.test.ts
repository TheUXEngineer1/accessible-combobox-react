import { describe, expect, it } from "vitest";
import { defaultFilter } from "../src";

const option = { value: "reunion", label: "Réunion Island" };

describe("defaultFilter", () => {
  it("matches anywhere in the label", () => {
    expect(defaultFilter(option, "island")).toBe(true);
  });

  it("ignores case, accents and surrounding spaces", () => {
    expect(defaultFilter(option, "  REUN ")).toBe(true);
    expect(defaultFilter({ value: "x", label: "Reunion" }, "réu")).toBe(true);
  });

  it("rejects non-matching text", () => {
    expect(defaultFilter(option, "france")).toBe(false);
  });
});
