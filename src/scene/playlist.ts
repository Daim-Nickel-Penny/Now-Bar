import type { AxolotlActivity } from "./axolotl-sprite.ts";

export type SceneId =
  | "axolotl"
  | "rain"
  | "night"
  | "forest"
  | "waves"
  | "aurora"
  | "neon"
  | "city"
  | "desert"
  | "ocean"
  | "mountain"
  | "cave"
  | "garden"
  | "library"
  | "studio"
  | "arcade"
  | "observatory"
  | "harbor"
  | "meadow"
  | "volcano"
  | "glacier"
  | "disco"
  | "hearth";

export type SceneMotion = "sparkle" | "flicker" | "drift" | "rain" | "swim";

export type Scene = {
  id: SceneId;
  kind: "field";
  motion: SceneMotion;
  loopMs: number;
  activity: AxolotlActivity;
};

export const playlist: readonly Scene[] = [
  { id: "axolotl", kind: "field", motion: "swim", loopMs: 22000, activity: "sleeping" },
  { id: "rain", kind: "field", motion: "rain", loopMs: 16000, activity: "reading" },
  { id: "night", kind: "field", motion: "drift", loopMs: 22000, activity: "sleeping" },
  { id: "forest", kind: "field", motion: "drift", loopMs: 20000, activity: "painting" },
  { id: "waves", kind: "field", motion: "flicker", loopMs: 17000, activity: "dancing" },
  { id: "aurora", kind: "field", motion: "drift", loopMs: 24000, activity: "sleeping" },
  { id: "neon", kind: "field", motion: "sparkle", loopMs: 16000, activity: "gaming" },
  { id: "city", kind: "field", motion: "sparkle", loopMs: 19000, activity: "guitar" },
  { id: "desert", kind: "field", motion: "drift", loopMs: 21000, activity: "chores" },
  { id: "ocean", kind: "field", motion: "swim", loopMs: 20000, activity: "dancing" },
  { id: "mountain", kind: "field", motion: "drift", loopMs: 23000, activity: "reading" },
  { id: "cave", kind: "field", motion: "flicker", loopMs: 18000, activity: "cooking" },
  { id: "garden", kind: "field", motion: "drift", loopMs: 20000, activity: "chores" },
  { id: "library", kind: "field", motion: "flicker", loopMs: 22000, activity: "reading" },
  { id: "studio", kind: "field", motion: "sparkle", loopMs: 17000, activity: "guitar" },
  { id: "arcade", kind: "field", motion: "sparkle", loopMs: 16000, activity: "gaming" },
  { id: "observatory", kind: "field", motion: "drift", loopMs: 25000, activity: "reading" },
  { id: "harbor", kind: "field", motion: "swim", loopMs: 21000, activity: "cooking" },
  { id: "meadow", kind: "field", motion: "drift", loopMs: 19000, activity: "painting" },
  { id: "volcano", kind: "field", motion: "flicker", loopMs: 18000, activity: "cooking" },
  { id: "glacier", kind: "field", motion: "drift", loopMs: 24000, activity: "sleeping" },
  { id: "disco", kind: "field", motion: "sparkle", loopMs: 20000, activity: "dancing" },
  { id: "hearth", kind: "field", motion: "flicker", loopMs: 18000, activity: "reading" },
];

export function sceneAt(index: number): Scene {
  const scene = playlist.at(index % playlist.length);
  if (scene === undefined) {
    throw new Error("playlist");
  }
  return scene;
}

export function nextScene(id: SceneId): Scene {
  const index = playlist.findIndex((scene) => scene.id === id);
  return sceneAt(index + 1);
}
