import { describe, expect, it } from "vitest";
import { BODY, SPRITE_H, SPRITE_W } from "./axolotl-sprite.ts";
import { AXOLOTL_PALETTE, mirrorPixels } from "./pixels.ts";

describe("axolotl body", () => {
  it("is a full rectangle of known pixels", () => {
    expect(BODY).toHaveLength(SPRITE_H);
    for (const line of BODY) {
      expect(line).toHaveLength(SPRITE_W);
      for (const char of line) {
        expect(char === "." || char in AXOLOTL_PALETTE).toBe(true);
      }
    }
  });

  it("has two eyes three rows tall", () => {
    const eyeRows = BODY.filter((line) => line.includes("E"));
    expect(eyeRows).toHaveLength(3);
    for (const line of eyeRows) {
      expect(line.split("E")).toHaveLength(5);
    }
  });

  it("wears the headphones from the logo: a band over the head and a note on one cup", () => {
    expect(BODY[0]).toMatch(/^\.+H+\.+$/);
    const noteRows = BODY.filter((line) => line.includes("N"));
    expect(noteRows.length).toBeGreaterThan(2);
    for (const line of noteRows) {
      expect(line).toMatch(/H+N+H+/);
    }
  });
});

describe("mirrorPixels", () => {
  it("flips a row so one gill grid can serve both sides", () => {
    expect(mirrorPixels(["..GG", "RG.."])).toEqual(["GG..", "..GR"]);
  });
});
