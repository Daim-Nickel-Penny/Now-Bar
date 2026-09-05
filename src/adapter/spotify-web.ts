import { buttonSaysPause, mediaPlaying, readImageSrc, readText } from "./read-text.ts";
import { startAdapter } from "./start-adapter.ts";
import { sanitizeTrack } from "../track/sanitize-track.ts";
import type { Track } from "../track/track.ts";

const PLAY_PAUSE = ["[data-testid='control-button-playpause']"];

function readSpotifyWeb(): Track | null {
  const bar = document.querySelector("[data-testid='now-playing-widget']");
  if (bar === null) {
    return null;
  }
  return sanitizeTrack({
    source: "spotifyWeb",
    title: readText(bar, ["[data-testid='context-item-info-title']", "[data-testid='context-item-link']"]),
    artist: readText(bar, [
      "[data-testid='context-item-info-subtitles']",
      "[data-testid='context-item-info-artist']",
    ]),
    album: null,
    artworkUrl: readImageSrc(bar, ["[data-testid='cover-art-image']", "img"]),
    playing: buttonSaysPause(document, PLAY_PAUSE) || mediaPlaying(document),
  });
}

void startAdapter({
  read: readSpotifyWeb,
  controls: {
    playPause: PLAY_PAUSE,
    previous: ["[data-testid='control-button-skip-back']"],
    next: ["[data-testid='control-button-skip-forward']"],
  },
});
