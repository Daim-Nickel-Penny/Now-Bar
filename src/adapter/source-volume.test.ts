import { describe, expect, it } from "vitest";
import { clampLevel, clampSteps } from "./source-volume.ts";

describe("clampLevel", () => {
  it("keeps a finite 0–1 value", () => {
    expect(clampLevel(0.42)).toBe(0.42);
    expect(clampLevel(0)).toBe(0);
    expect(clampLevel(1)).toBe(1);
  });

  it("fails closed on junk so a bad read cannot blast the tab", () => {
    expect(clampLevel(undefined)).toBe(0);
    expect(clampLevel("0.8")).toBe(0);
    expect(clampLevel(NaN)).toBe(0);
    expect(clampLevel(Infinity)).toBe(0);
    expect(clampLevel(-2)).toBe(0);
    expect(clampLevel(3)).toBe(1);
  });
});

describe("clampSteps", () => {
  it("allows only one notch", () => {
    expect(clampSteps(1)).toBe(1);
    expect(clampSteps(-1)).toBe(-1);
    expect(clampSteps(0)).toBe(0);
    expect(clampSteps(99)).toBe(1);
    expect(clampSteps(-99)).toBe(-1);
    expect(clampSteps(NaN)).toBe(0);
    expect(clampSteps("1")).toBe(0);
  });
});
