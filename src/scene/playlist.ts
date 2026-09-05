import type { SceneId } from "./scene-id.ts";
import { SCENE_IDS } from "./scene-id.ts";

export type Activity = "reading" | "sleeping" | "dancing" | "guitar" | "gaming" | "cooking";

export type Scene = {
  id: SceneId;
  name: string;
  loopMs: number;
  activity: Activity;
};

const SCENES: Record<SceneId, Scene> = {
  hearth: { id: "hearth", name: "Hearth", loopMs: 12000, activity: "reading" },
  rain: { id: "rain", name: "Rainy window", loopMs: 12000, activity: "sleeping" },
  disco: { id: "disco", name: "Disco", loopMs: 8000, activity: "dancing" },
  night: { id: "night", name: "Rooftop night", loopMs: 16000, activity: "guitar" },
  arcade: { id: "arcade", name: "Arcade", loopMs: 8000, activity: "gaming" },
  kitchen: { id: "kitchen", name: "Kitchen", loopMs: 12000, activity: "cooking" },
};

export function sceneById(id: SceneId): Scene {
  return SCENES[id];
}

export function allScenes(): readonly Scene[] {
  return SCENE_IDS.map(sceneById);
}

export function firstScene(active: readonly SceneId[]): Scene {
  const id = active[0] ?? SCENE_IDS[0];
  return sceneById(id);
}

export function nextScene(current: SceneId, active: readonly SceneId[]): Scene {
  if (active.length === 0) {
    return sceneById(SCENE_IDS[0]);
  }
  const index = active.indexOf(current);
  const nextId = active[(index + 1) % active.length] ?? active[0];
  return sceneById(nextId ?? SCENE_IDS[0]);
}
