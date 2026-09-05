import { parseNowPlayingReply, type NowPlayingReply, type PanelMail } from "../mail/message.ts";
import { isShellVariant } from "../owner/shell-variant.ts";
import {
  isAsciiStyle,
  readPreferences,
  writePreferences,
  type Preferences,
} from "../preferences/preferences.ts";
import { allScenes } from "../scene/playlist.ts";
import { isSceneId, type SceneId } from "../scene/scene-id.ts";
import type { Track } from "../track/track.ts";

function must<T extends Element>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (node === null) {
    throw new Error(`panel:${selector}`);
  }
  return node;
}

const status = must<HTMLElement>("#status");
const art = must<HTMLImageElement>("#art");
const title = must<HTMLElement>("#title");
const artist = must<HTMLElement>("#artist");
const bars = must<HTMLElement>("#bars");
const openButton = must<HTMLButtonElement>("#open");
const hint = must<HTMLElement>("#hint");
const links = must<HTMLElement>("#links");
const openOnPlay = must<HTMLInputElement>("#open-on-play");
const sceneChips = must<HTMLElement>("#scenes");

const SOURCE_NAME = { youtubeMusic: "YouTube Music", spotifyWeb: "Spotify" } as const;

function paintTrack(track: Track | null, connected: boolean): void {
  status.dataset.state = connected ? "connected" : "idle";
  status.textContent = track ? SOURCE_NAME[track.source] : connected ? "Music tab ready" : "Open a music tab";
  openButton.disabled = !connected;
  links.hidden = connected;
  bars.dataset.playing = track?.playing === true ? "true" : "false";
  if (track === null) {
    title.textContent = "Nothing playing";
    artist.textContent = connected ? "Press play in the music tab" : "Press play on YouTube Music or Spotify";
    art.removeAttribute("src");
    return;
  }
  title.textContent = track.title;
  artist.textContent = track.artist;
  if (track.artworkUrl === null) {
    art.removeAttribute("src");
  } else if (art.getAttribute("src") !== track.artworkUrl) {
    art.src = track.artworkUrl;
  }
}

async function send(mail: PanelMail): Promise<NowPlayingReply | null> {
  try {
    return parseNowPlayingReply(await chrome.runtime.sendMessage(mail));
  } catch {
    return null;
  }
}

async function refreshTrack(): Promise<void> {
  const reply = await send({ type: "requestTrack" });
  paintTrack(reply?.track ?? null, reply?.connected ?? false);
}

function radio(name: string): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>(`input[name='${name}']:checked`);
}

function readForm(current: Preferences): Preferences {
  const style = radio("ascii-style")?.value;
  const variant = radio("variant")?.value;
  const scenes: SceneId[] = [];
  for (const input of sceneChips.querySelectorAll<HTMLInputElement>("input:checked")) {
    if (isSceneId(input.value)) {
      scenes.push(input.value);
    }
  }
  return {
    openOnPlay: openOnPlay.checked,
    asciiStyle: isAsciiStyle(style) ? style : current.asciiStyle,
    variant: isShellVariant(variant) ? variant : current.variant,
    activeScenes: scenes.length === 0 ? current.activeScenes : scenes,
  };
}

function paintForm(preferences: Preferences): void {
  openOnPlay.checked = preferences.openOnPlay;
  for (const input of document.querySelectorAll<HTMLInputElement>("input[type='radio']")) {
    input.checked =
      (input.name === "ascii-style" && input.value === preferences.asciiStyle) ||
      (input.name === "variant" && input.value === preferences.variant);
  }
  for (const input of sceneChips.querySelectorAll<HTMLInputElement>("input")) {
    input.checked = isSceneId(input.value) && preferences.activeScenes.includes(input.value);
  }
}

function buildSceneChips(): void {
  for (const scene of allScenes()) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = scene.id;
    const text = document.createElement("span");
    text.textContent = scene.name;
    label.append(input, text);
    sceneChips.appendChild(label);
  }
}

async function main(): Promise<void> {
  buildSceneChips();
  let preferences = await readPreferences();
  paintForm(preferences);

  document.addEventListener("change", () => {
    preferences = readForm(preferences);
    paintForm(preferences);
    void writePreferences(preferences);
  });

  openButton.addEventListener("click", () => {
    hint.hidden = false;
    void send({ type: "openFloater" }).then(() => window.close());
  });

  for (const link of links.querySelectorAll<HTMLButtonElement>(".link")) {
    link.addEventListener("click", () => {
      void chrome.tabs.create({ url: link.dataset.url });
    });
  }

  chrome.storage.session.onChanged.addListener((changes) => {
    if ("nowPlaying" in changes || "sourceTabId" in changes) {
      void refreshTrack();
    }
  });
  await refreshTrack();
}

void main();
