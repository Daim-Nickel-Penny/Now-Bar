import { parseNowPlayingReply, type NowPlayingReply, type PanelMail } from "../mail/message.ts";
import { attachPlayingBars } from "../owner/playing-bars.ts";
import { isShellVariant } from "../owner/shell-variant.ts";
import { SESSION_SOURCE_KEY } from "../mailbox/session-now-playing.ts";
import {
  DEFAULT_PREFERENCES,
  isAsciiStyle,
  readPreferences,
  writePreferences,
  type Preferences,
} from "../preferences/preferences.ts";
import { allScenes } from "../scene/playlist.ts";
import { isSceneId, type SceneId } from "../scene/scene-id.ts";

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
const playingBars = attachPlayingBars(bars);
const openButton = must<HTMLButtonElement>("#open");
const hint = must<HTMLElement>("#hint");
const links = must<HTMLElement>("#links");
const openOnPlay = must<HTMLInputElement>("#open-on-play");
const sceneChips = must<HTMLElement>("#scenes");

const SOURCE_NAME = { youtubeMusic: "YouTube Music", spotifyWeb: "Spotify" } as const;

function paintTrack(reply: NowPlayingReply | null): void {
  const connected = reply?.connected ?? false;
  const track = reply?.track ?? null;
  /**
   * A Source tab whose player bar no longer parses is a broken extension, not silence. Saying so
   * is the difference between "my music stopped" and "Now Bar needs updating for this layout".
   */
  const rotted = connected && reply?.readable === false;
  const playing = track?.playing === true;
  status.dataset.state = rotted ? "stuck" : playing ? "playing" : connected ? "connected" : "idle";
  status.textContent = rotted
    ? "Can't read this page"
    : track
      ? SOURCE_NAME[track.source]
      : connected
        ? "Music tab ready"
        : "Open a music tab";
  openButton.disabled = !connected;
  links.hidden = connected;
  bars.dataset.playing = playing ? "true" : "false";
  playingBars.setPlaying(playing);
  if (rotted) {
    title.textContent = "Can't read the player";
    artist.textContent = "The site changed its layout. Now Bar needs an update.";
    art.removeAttribute("src");
    return;
  }
  if (track === null) {
    title.textContent = "Nothing playing";
    artist.textContent = connected ? "Press play in the music tab" : "Press play on YouTube Music or Spotify";
    art.removeAttribute("src");
    return;
  }
  title.textContent = track.title;
  title.title = track.title;
  artist.textContent = track.artist === "" ? SOURCE_NAME[track.source] : track.artist;
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
  paintTrack(await send({ type: "requestTrack" }));
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
  let preferences = await readPreferences().catch(() => DEFAULT_PREFERENCES);
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
    if (SESSION_SOURCE_KEY in changes) {
      void refreshTrack();
    }
  });
  await refreshTrack();
}

void main();
