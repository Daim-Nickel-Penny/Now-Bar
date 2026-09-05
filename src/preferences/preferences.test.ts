import { describe, expect, it } from "vitest";
import { DEFAULT_PREFERENCES, sanitizePreferences } from "./preferences.ts";

describe("sanitizePreferences", () => {
  it("falls back to defaults for junk", () => {
    expect(sanitizePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(sanitizePreferences("x")).toEqual(DEFAULT_PREFERENCES);
    expect(sanitizePreferences({ asciiStyle: "neon", variant: "huge" })).toEqual(
      DEFAULT_PREFERENCES,
    );
  });

  it("keeps known scenes in playlist order and drops unknown ones", () => {
    const next = sanitizePreferences({ activeScenes: ["disco", "hearth", "matrix"] });
    expect(next.activeScenes).toEqual(["hearth", "disco"]);
  });

  it("never allows an empty playlist", () => {
    expect(sanitizePreferences({ activeScenes: [] }).activeScenes).toEqual(
      DEFAULT_PREFERENCES.activeScenes,
    );
  });

  it("keeps good values", () => {
    expect(
      sanitizePreferences({
        openOnPlay: false,
        asciiStyle: "glyphs",
        variant: "pill",
        activeScenes: ["rain"],
        cycleScenes: false,
      }),
    ).toEqual({
      openOnPlay: false,
      asciiStyle: "glyphs",
      variant: "pill",
      activeScenes: ["rain"],
      cycleScenes: false,
    });
  });

  it("treats a non-boolean cycle flag as the default, never a coerced truthy", () => {
    expect(sanitizePreferences({ cycleScenes: "true" }).cycleScenes).toBe(true);
    expect(sanitizePreferences({ cycleScenes: 0 }).cycleScenes).toBe(true);
    expect(sanitizePreferences({ cycleScenes: false }).cycleScenes).toBe(false);
  });
});
