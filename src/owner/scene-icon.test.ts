import { describe, expect, it } from "vitest";
import { ICON_PATHS } from "./icons.ts";
import { iconForScene } from "./scene-icon.ts";
import { SCENE_IDS } from "../scene/scene-id.ts";

describe("iconForScene", () => {
  it("maps every Scene to an inlined Hugeicon", () => {
    for (const id of SCENE_IDS) {
      const name = iconForScene(id);
      expect(ICON_PATHS[name].length).toBeGreaterThan(0);
    }
  });
});
