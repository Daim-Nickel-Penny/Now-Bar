export const SCENE_IDS = ["hearth", "rain", "disco", "night", "arcade", "kitchen"] as const;

export type SceneId = (typeof SCENE_IDS)[number];

export function isSceneId(value: unknown): value is SceneId {
  return typeof value === "string" && (SCENE_IDS as readonly string[]).includes(value);
}
