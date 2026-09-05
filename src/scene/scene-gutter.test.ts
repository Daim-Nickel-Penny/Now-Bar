import { describe, expect, it } from "vitest";
import { clampGutterCss } from "./scene-gutter.ts";

describe("clampGutterCss", () => {
  it("adds air above the card and stays inside the cap", () => {
    expect(clampGutterCss(72, 230)).toBe(80);
  });

  it("never eats the whole Scene on a short Floater", () => {
    expect(clampGutterCss(90, 160)).toBe(72);
  });

  it("is zero when the card does not cover the Scene", () => {
    expect(clampGutterCss(0, 230)).toBe(0);
    expect(clampGutterCss(72, 0)).toBe(0);
  });
});
