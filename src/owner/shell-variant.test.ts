import { describe, expect, it } from "vitest";
import { MAX_SIZE, MIN_SIZE, clampSize, nextVariant, variantSize } from "./shell-variant.ts";

describe("clampSize", () => {
  it("keeps a size the window can actually take", () => {
    expect(clampSize({ width: 420, height: 260 })).toEqual({ width: 420, height: 260 });
  });

  it("pulls a dragged-too-small window back to the floor", () => {
    expect(clampSize({ width: 10, height: 5 })).toEqual(MIN_SIZE);
  });

  it("leaves the icon variant alone, the smallest thing the Floater opens as", () => {
    expect(clampSize(variantSize("icon"))).toEqual(variantSize("icon"));
  });

  it("pulls a dragged-too-large window back to the ceiling", () => {
    expect(clampSize({ width: 99999, height: 99999 })).toEqual(MAX_SIZE);
  });

  it("rounds to whole pixels so resizeTo is not handed a fraction", () => {
    expect(clampSize({ width: 380.6, height: 230.4 })).toEqual({ width: 381, height: 230 });
  });
});

describe("nextVariant", () => {
  it("cycles card to pill to icon and back", () => {
    expect(nextVariant("expanded")).toBe("pill");
    expect(nextVariant("pill")).toBe("icon");
    expect(nextVariant("icon")).toBe("expanded");
  });

  it("gives every variant a size within the clamp", () => {
    for (const variant of ["expanded", "pill", "icon"] as const) {
      expect(clampSize(variantSize(variant))).toEqual(variantSize(variant));
    }
  });
});
