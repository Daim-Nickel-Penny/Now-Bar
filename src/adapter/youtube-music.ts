import { buttonSaysPause, mediaPlaying, readImageSrc, readText } from "./read-text.ts";
import { startAdapter } from "./start-adapter.ts";
import { sanitizeTrack } from "../track/sanitize-track.ts";
import type { Track } from "../track/track.ts";

const PLAY_PAUSE = ["ytmusic-player-bar #play-pause-button", "#play-pause-button"];

function readYoutubeMusic(): Track | null {
  const bar = document.querySelector("ytmusic-player-bar");
  if (bar === null) {
    return null;
  }
  const byline = readText(bar, [".byline", ".subtitle"]).split("•");
  return sanitizeTrack({
    source: "youtubeMusic",
    title: readText(bar, [".title", "yt-formatted-string.title"]),
    artist: byline[0]?.trim() ?? "",
    album: byline.length > 2 ? (byline[1]?.trim() ?? null) : null,
    artworkUrl: readImageSrc(bar, ["img.image", "img#img", "img"]),
    playing: mediaPlaying(document) || buttonSaysPause(document, PLAY_PAUSE),
  });
}

void startAdapter({
  read: readYoutubeMusic,
  controls: {
    playPause: PLAY_PAUSE,
    previous: ["ytmusic-player-bar .previous-button", ".previous-button"],
    next: ["ytmusic-player-bar .next-button", ".next-button"],
  },
});
