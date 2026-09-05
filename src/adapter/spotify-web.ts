import { observeBar, postTrack } from "./observe-bar.ts";
import { mediaPlaying, readImageSrc, readText } from "./read-text.ts";
import { sanitizeTrack } from "../track/sanitize-track.ts";
import { initFloater, setTrack } from "./floater.ts";

function readSpotifyWeb(): ReturnType<typeof sanitizeTrack> {
  const bar = document.querySelector("[data-testid='now-playing-widget']");
  if (bar === null) {
    return null;
  }
  return sanitizeTrack({
    source: "spotifyWeb",
    title: readText(bar, [
      "[data-testid='context-item-info-title']",
      "[data-testid='context-item-link']",
    ]),
    artist: readText(bar, [
      "[data-testid='context-item-info-artist']",
      "[data-testid='context-item-info-subtitles']",
    ]),
    album: null,
    artworkUrl: readImageSrc(bar, [
      "[data-testid='cover-art-image']",
      "img",
    ]),
    playing: mediaPlaying(document),
  });
}

observeBar(readSpotifyWeb, (track) => {
  postTrack(track);
  setTrack(track);
});

initFloater();
