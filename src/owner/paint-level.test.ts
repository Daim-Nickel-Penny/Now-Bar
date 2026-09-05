import { describe, expect, it } from "vitest";
import { iconForLevel } from "./paint-level.ts";

describe("iconForLevel", () => {
  it("picks mute, low, or high from a clamped level", () => {
    expect(iconForLevel(0)).toBe("mute");
    expect(iconForLevel(0.2)).toBe("volumeLow");
    expect(iconForLevel(0.4)).toBe("volumeHigh");
    expect(iconForLevel(1)).toBe("volumeHigh");
    expect(iconForLevel(Number.NaN)).toBe("mute");
  });
});
