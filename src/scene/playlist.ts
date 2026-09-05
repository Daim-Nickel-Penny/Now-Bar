export type SceneId =
  | "disco"
  | "hearth"
  | "rain"
  | "night"
  | "forest"
  | "waves"
  | "aurora"
  | "neon";

export type SceneMotion = "sparkle" | "flicker" | "drift" | "rain";

export type Scene = {
  id: SceneId;
  src: string;
  kind: "plate" | "field";
  motion: SceneMotion;
  loopMs: number;
};

export const playlist: readonly Scene[] = [
  { id: "disco", src: "scenes/disco.png", kind: "plate", motion: "sparkle", loopMs: 20000 },
  { id: "hearth", src: "scenes/hearth.png", kind: "plate", motion: "flicker", loopMs: 18000 },
  { id: "rain", src: "", kind: "field", motion: "rain", loopMs: 16000 },
  { id: "night", src: "", kind: "field", motion: "drift", loopMs: 22000 },
  { id: "forest", src: "", kind: "field", motion: "drift", loopMs: 20000 },
  { id: "waves", src: "", kind: "field", motion: "flicker", loopMs: 17000 },
  { id: "aurora", src: "", kind: "field", motion: "drift", loopMs: 24000 },
  { id: "neon", src: "", kind: "field", motion: "sparkle", loopMs: 16000 },
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
