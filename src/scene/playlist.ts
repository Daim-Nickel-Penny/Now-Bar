import type { AxolotlActivity } from "./axolotl-sprite.ts";

export type SceneId =
  | "disco"
  | "hearth"
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
  | "glacier";

export type SceneMotion = "sparkle" | "flicker" | "drift" | "rain" | "swim";

export type Scene = {
  id: SceneId;
  src: string;
  kind: "plate" | "field";
  motion: SceneMotion;
  loopMs: number;
  activity: AxolotlActivity;
};

export const playlist: readonly Scene[] = [
  { id: "disco", src: "scenes/disco.png", kind: "plate", motion: "sparkle", loopMs: 20000, activity: "dancing" },
  { id: "hearth", src: "scenes/hearth.png", kind: "plate", motion: "flicker", loopMs: 18000, activity: "reading" },
  { id: "axolotl", src: "", kind: "field", motion: "swim", loopMs: 22000, activity: "sleeping" },
  { id: "rain", src: "", kind: "field", motion: "rain", loopMs: 16000, activity: "reading" },
  { id: "night", src: "", kind: "field", motion: "drift", loopMs: 22000, activity: "sleeping" },
  { id: "forest", src: "", kind: "field", motion: "drift", loopMs: 20000, activity: "painting" },
  { id: "waves", src: "", kind: "field", motion: "flicker", loopMs: 17000, activity: "dancing" },
  { id: "aurora", src: "", kind: "field", motion: "drift", loopMs: 24000, activity: "sleeping" },
  { id: "neon", src: "", kind: "field", motion: "sparkle", loopMs: 16000, activity: "gaming" },
  { id: "city", src: "", kind: "field", motion: "sparkle", loopMs: 19000, activity: "guitar" },
  { id: "desert", src: "", kind: "field", motion: "drift", loopMs: 21000, activity: "chores" },
  { id: "ocean", src: "", kind: "field", motion: "swim", loopMs: 20000, activity: "dancing" },
  { id: "mountain", src: "", kind: "field", motion: "drift", loopMs: 23000, activity: "reading" },
  { id: "cave", src: "", kind: "field", motion: "flicker", loopMs: 18000, activity: "cooking" },
  { id: "garden", src: "", kind: "field", motion: "drift", loopMs: 20000, activity: "chores" },
  { id: "library", src: "", kind: "field", motion: "flicker", loopMs: 22000, activity: "reading" },
  { id: "studio", src: "", kind: "field", motion: "sparkle", loopMs: 17000, activity: "guitar" },
  { id: "arcade", src: "", kind: "field", motion: "sparkle", loopMs: 16000, activity: "gaming" },
  { id: "observatory", src: "", kind: "field", motion: "drift", loopMs: 25000, activity: "reading" },
  { id: "harbor", src: "", kind: "field", motion: "swim", loopMs: 21000, activity: "cooking" },
  { id: "meadow", src: "", kind: "field", motion: "drift", loopMs: 19000, activity: "painting" },
  { id: "volcano", src: "", kind: "field", motion: "flicker", loopMs: 18000, activity: "cooking" },
  { id: "glacier", src: "", kind: "field", motion: "drift", loopMs: 24000, activity: "sleeping" },
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
