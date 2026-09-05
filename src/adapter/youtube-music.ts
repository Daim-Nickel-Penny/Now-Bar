import { isPlaying, readImageSrc, readText } from "./read-text.ts";
import { SILENT, parsed, type Reading } from "./reading.ts";
import { startAdapter } from "./start-adapter.ts";
import { sanitizeTrack } from "../track/sanitize-track.ts";

const BAR = ["ytmusic-player-bar", "ytmusic-app-layout ytmusic-player-bar"];
const PLAY_PAUSE = ["ytmusic-player-bar #play-pause-button", "#play-pause-button"];
const TITLE = [".title.ytmusic-player-bar", "yt-formatted-string.title", ".title"];
const BYLINE = [".byline.ytmusic-player-bar", "yt-formatted-string.byline", ".byline", ".subtitle"];
const ART = ["img.image.ytmusic-player-bar", "img.image", "img#img", "img"];

function findBar(): Element | null {
  for (const selector of BAR) {
    const node = document.querySelector(selector);
    if (node !== null) {
      return node;
    }
  }
  return null;
}

/** The byline packs artist, album, and year into one bullet-separated string. */
function splitByline(byline: string): { artist: string; album: string | null } {
  const parts = byline.split("\u2022").map((part) => part.trim());
  return { artist: parts[0] ?? "", album: parts.length > 2 ? (parts[1] ?? null) : null };
}

function readYoutubeMusic(): Reading {
  const bar = findBar();
  if (bar === null) {
    return SILENT;
  }
  const { artist, album } = splitByline(readText(bar, BYLINE));
  return parsed(
    sanitizeTrack({
      source: "youtubeMusic",
      title: readText(bar, TITLE),
    artist,
    album,
      artworkUrl: readImageSrc(bar, ART),
      playing: isPlaying(document, PLAY_PAUSE),
    }),
  );
}

void startAdapter({
  read: readYoutubeMusic,
  controls: {
    playPause: PLAY_PAUSE,
    previous: ["ytmusic-player-bar .previous-button", ".previous-button"],
    next: ["ytmusic-player-bar .next-button", ".next-button"],
    mute: ["ytmusic-player-bar #mute-button", "#mute-button"],
  },
});
