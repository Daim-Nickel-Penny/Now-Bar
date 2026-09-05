import { describe, expect, it } from "vitest";
import { nextBarLevel } from "./playing-bars.ts";

describe("nextBarLevel", () => {
  it("spikes the high end of that bar's band", () => {
    expect(nextBarLevel(2, 0.04, 0.5)).toBe(1);
    expect(nextBarLevel(0, 0.04, 0.5)).toBe(0.58);
  });

  it("drops to the low end of that bar's band", () => {
    expect(nextBarLevel(2, 0.15, 0.5)).toBe(0.22);
    expect(nextBarLevel(4, 0.15, 0.5)).toBe(0.1);
  });

  it("blends inside the band so two rolls rarely match", () => {
    expect(nextBarLevel(1, 0.5, 0)).toBe(0.16);
    expect(nextBarLevel(1, 0.5, 1)).toBe(0.86);
    expect(nextBarLevel(1, 0.5, 0.5)).toBe(0.51);
  });

  it("rejects a bar that does not exist", () => {
    expect(() => nextBarLevel(5, 0.5, 0.5)).toThrow("playing-bars:band");
  });
});
