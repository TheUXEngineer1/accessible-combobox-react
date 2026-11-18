import { describe, expect, it } from "vitest";
import { moveActiveIndex, pageSize } from "../src/Combobox/navigation";

const options = [
  { disabled: true },
  {},
  {},
  { disabled: true },
  {},
  { disabled: true },
];

describe("moveActiveIndex", () => {
  it("finds the first and last enabled options", () => {
    expect(moveActiveIndex(options, -1, "first")).toBe(1);
    expect(moveActiveIndex(options, -1, "last")).toBe(4);
  });

  it("starts from either end when nothing is active", () => {
    expect(moveActiveIndex(options, -1, "next")).toBe(1);
    expect(moveActiveIndex(options, -1, "previous")).toBe(4);
  });

  it("skips disabled options", () => {
    expect(moveActiveIndex(options, 2, "next")).toBe(4);
    expect(moveActiveIndex(options, 4, "previous")).toBe(2);
  });

  it("stops at either end instead of wrapping", () => {
    expect(moveActiveIndex(options, 4, "next")).toBe(4);
    expect(moveActiveIndex(options, 1, "previous")).toBe(1);
  });

  it("moves by a page and clamps to the enabled ends", () => {
    const many = Array.from({ length: 30 }, () => ({}));
    expect(moveActiveIndex(many, 0, "pageDown")).toBe(pageSize);
    expect(moveActiveIndex(many, 25, "pageDown")).toBe(29);
    expect(moveActiveIndex(many, 15, "pageUp")).toBe(5);
    expect(moveActiveIndex(many, 3, "pageUp")).toBe(0);
    expect(moveActiveIndex(options, 1, "pageDown")).toBe(4);
  });

  it("returns -1 when no option is enabled", () => {
    expect(moveActiveIndex([{ disabled: true }], -1, "next")).toBe(-1);
    expect(moveActiveIndex([], -1, "first")).toBe(-1);
  });
});
