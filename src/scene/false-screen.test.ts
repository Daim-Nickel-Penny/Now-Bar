import { describe, expect, it } from "vitest";
import { speckLevel } from "./false-screen.ts";

describe("speckLevel", () => {
  it("skips some cells so the field is dust, not a grid fill", () => {
    const levels = Array.from({ length: 24 }, (_, col) => speckLevel(col, 0, 8));
    expect(levels.some((level) => level === null)).toBe(true);
    expect(levels.some((level) => level !== null)).toBe(true);
  });

  it("is dimmer at the lip than at the bottom", () => {
    const pair = Array.from({ length: 40 }, (_, col) => ({
      top: speckLevel(col, 0, 8),
      bottom: speckLevel(col, 7, 8),
    })).find((cell) => cell.top !== null && cell.bottom !== null);
    expect(pair).toBeDefined();
    expect(pair?.bottom ?? 0).toBeGreaterThan(pair?.top ?? 0);
  });
});
