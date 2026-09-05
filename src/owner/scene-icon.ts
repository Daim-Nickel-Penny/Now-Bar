import type { SceneId } from "../scene/scene-id.ts";
import type { IconName } from "./icons.ts";

const SCENE_ICON = {
  hearth: "hearth",
  rain: "rain",
  disco: "disco",
  night: "night",
  arcade: "arcade",
  kitchen: "kitchen",
} as const satisfies Record<SceneId, IconName>;

export function iconForScene(id: SceneId): IconName {
  return SCENE_ICON[id];
}
