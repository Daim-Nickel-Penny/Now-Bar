import { createSceneLoop } from "../scene/loop.ts";
import { openFloater } from "./open-floater.ts";
import { paintNowPlaying } from "./paint-now-playing.ts";
import { cycleShell, type ShellVariant } from "./shell-variant.ts";
import type { Track } from "../track/track.ts";

const shell = document.querySelector<HTMLElement>("#shell");
const sceneRoot = document.querySelector<HTMLElement>("#scene");
const pill = document.querySelector<HTMLElement>("#pill");
const title = document.querySelector<HTMLElement>("#title");
const artist = document.querySelector<HTMLElement>("#artist");
const art = document.querySelector<HTMLImageElement>("#art");

if (
  shell === null ||
  sceneRoot === null ||
  pill === null ||
  title === null ||
  artist === null ||
  art === null
) {
  throw new Error("owner");
}

const scenes = createSceneLoop(sceneRoot);
let variant: ShellVariant = "expanded";

function applyTrack(track: Track | null): void {
  paintNowPlaying(title, artist, art, track);
}

chrome.storage.session.onChanged.addListener((changes) => {
  const next = changes.nowPlaying;
  if (next === undefined) {
    return;
  }
  applyTrack((next.newValue as Track | null | undefined) ?? null);
});

void chrome.runtime.sendMessage({ type: "requestTrack" }, (response: unknown) => {
  if (response !== null && typeof response === "object" && "track" in response) {
    applyTrack((response as { track: Track | null }).track);
  }
});

pill.addEventListener("click", (event) => {
  event.stopPropagation();
  variant = cycleShell(shell, scenes, variant);
  if (variant === "expanded" && documentPictureInPicture.window === null) {
    void openFloater(shell);
  }
});

sceneRoot.addEventListener("click", () => {
  if (variant !== "expanded") {
    return;
  }
  void scenes.skip();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" || variant !== "expanded") {
    scenes.stop();
    return;
  }
  void scenes.start();
});

void scenes.start();

shell.addEventListener(
  "pointerdown",
  () => {
    if (documentPictureInPicture.window !== null) {
      return;
    }
    void openFloater(shell);
  },
  { once: true },
);
