import { isPlaying, readImageSrc, readText } from "./read-text.ts";
import { SILENT, parsed, type Reading } from "./reading.ts";
import { startAdapter } from "./start-adapter.ts";
import { sanitizeTrack } from "../track/sanitize-track.ts";

const BAR = ["[data-testid='now-playing-widget']", "footer [data-testid='now-playing-bar']", "footer"];
const PLAY_PAUSE = [
  "[data-testid='control-button-playpause']",
  "button[data-testid='control-button-playpause']",
];
const TITLE = [
  "[data-testid='context-item-info-title']",
  "[data-testid='context-item-link']",
  "[data-testid='nowplaying-track-link']",
];
const ARTIST = [
  "[data-testid='context-item-info-subtitles']",
  "[data-testid='context-item-info-artist']",
];
const ART = ["[data-testid='cover-art-image']", "img[data-testid='cover-art-image']", "img"];

function findBar(): Element | null {
  for (const selector of BAR) {
    const node = document.querySelector(selector);
    if (node !== null) {
      return node;
    }
  }
  return null;
}

function readSpotifyWeb(): Reading {
  const bar = findBar();
  if (bar === null) {
    return SILENT;
  }
  return parsed(
    sanitizeTrack({
      source: "spotifyWeb",
      title: readText(bar, TITLE),
      artist: readText(bar, ARTIST),
      album: null,
      artworkUrl: readImageSrc(bar, ART),
      playing: isPlaying(document, PLAY_PAUSE),
    }),
  );
}

void startAdapter({
  read: readSpotifyWeb,
  controls: {
    playPause: PLAY_PAUSE,
    previous: ["[data-testid='control-button-skip-back']"],
    next: ["[data-testid='control-button-skip-forward']"],
    mute: ["[data-testid='volume-bar-toggle-mute-button']"],
  },
});
