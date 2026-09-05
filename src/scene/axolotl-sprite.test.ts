import { describe, expect, it } from "vitest";
import { BODY, SPRITE_H, SPRITE_W } from "./axolotl-sprite.ts";
import { AXOLOTL_PALETTE } from "./pixels.ts";

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

  it("has two eyes two rows tall", () => {
    const eyeRows = BODY.filter((line) => line.includes("E"));
    expect(eyeRows).toHaveLength(2);
    expect(eyeRows[0]?.split("E").length).toBe(5);
  });
});
