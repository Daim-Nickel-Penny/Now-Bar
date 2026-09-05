import { createSceneLoop } from "../scene/loop.ts";
import { openFloater } from "./open-floater.ts";
import { paintNowPlaying } from "./paint-now-playing.ts";
import { applyVariant, nextVariant, type ShellVariant } from "./shell-variant.ts";
import type { Track } from "../track/track.ts";

const shell = document.querySelector<HTMLElement>("#shell");
const sceneRoot = document.querySelector<HTMLElement>("#scene");
const card = document.querySelector<HTMLElement>("#card");
const title = document.querySelector<HTMLElement>("#title");
const artist = document.querySelector<HTMLElement>("#artist");
const art = document.querySelector<HTMLImageElement>("#art");
const artMini = document.querySelector<HTMLImageElement>("#art-mini");
const playButtonEl = document.querySelector<HTMLButtonElement>("#play");
const prevButton = document.querySelector<HTMLButtonElement>("#prev");
const nextButton = document.querySelector<HTMLButtonElement>("#next");
const sceneSkipButton = document.querySelector<HTMLButtonElement>("#scene-skip");
const collapseButton = document.querySelector<HTMLButtonElement>("#collapse");
const closeButton = document.querySelector<HTMLButtonElement>("#close");
const expandButton = document.querySelector<HTMLButtonElement>("#expand");

if (
  shell === null ||
  sceneRoot === null ||
  card === null ||
  title === null ||
  artist === null ||
  art === null ||
  artMini === null ||
  playButtonEl === null ||
  prevButton === null ||
  nextButton === null ||
  sceneSkipButton === null ||
  collapseButton === null ||
  closeButton === null ||
  expandButton === null
) {
  throw new Error("owner");
}

const shellEl = shell;
const sceneEl = sceneRoot;
const titleEl = title;
const artistEl = artist;
const artEl = art;
const artMiniEl = artMini;
const playEl = playButtonEl;
const prevEl = prevButton;
const nextEl = nextButton;
const sceneSkipEl = sceneSkipButton;
const collapseEl = collapseButton;
const closeEl = closeButton;
const expandEl = expandButton;
const scenes = createSceneLoop(sceneEl);
let variant: ShellVariant = "expanded";

function applyTrack(track: Track | null): void {
  paintNowPlaying(titleEl, artistEl, artEl, track);
  if (track?.artworkUrl) {
    artMiniEl.src = track.artworkUrl;
  } else {
    artMiniEl.removeAttribute("src");
  }
  playEl.setAttribute("aria-label", track?.playing ? "Pause" : "Play");
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

function togglePlay(): void {
  const media = document.querySelector<HTMLMediaElement>("video, audio");
  if (media === null) {
    return;
  }
  if (media.paused) {
    void media.play();
  } else {
    media.pause();
  }
}

playEl.addEventListener("click", (event) => {
  event.stopPropagation();
  togglePlay();
});

prevEl.addEventListener("click", (event) => {
  event.stopPropagation();
});

nextEl.addEventListener("click", (event) => {
  event.stopPropagation();
});

sceneSkipEl.addEventListener("click", (event) => {
  event.stopPropagation();
  void scenes.skip();
});

collapseEl.addEventListener("click", (event) => {
  event.stopPropagation();
  variant = nextVariant(variant);
  applyVariant(shellEl, scenes, variant);
});

expandEl.addEventListener("click", (event) => {
  event.stopPropagation();
  variant = "expanded";
  applyVariant(shellEl, scenes, variant);
});

closeEl.addEventListener("click", (event) => {
  event.stopPropagation();
  window.close();
});

sceneEl.addEventListener("click", () => {
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

shellEl.addEventListener(
  "pointerdown",
  () => {
    if (documentPictureInPicture.window !== null) {
      return;
    }
    void openFloater(shellEl);
  },
  { once: true },
);
