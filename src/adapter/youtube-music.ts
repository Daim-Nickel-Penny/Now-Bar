import { observeBar, postTrack } from "./observe-bar.ts";
import { mediaPlaying, readImageSrc, readText } from "./read-text.ts";
import { sanitizeTrack } from "../track/sanitize-track.ts";
import { initFloater, setTrack } from "./floater.ts";

function readYoutubeMusic(): ReturnType<typeof sanitizeTrack> {
  const bar = document.querySelector("ytmusic-player-bar");
  if (bar === null) {
    return null;
  }
  return sanitizeTrack({
    source: "youtubeMusic",
    title: readText(bar, [".title", "yt-formatted-string.title"]),
    artist: readText(bar, [".byline", ".subtitle", ".ytmusic-player-bar.subtitle"]),
    album: null,
    artworkUrl: readImageSrc(bar, ["img#img", "img"]),
    playing: mediaPlaying(document),
  });
}

observeBar(readYoutubeMusic, (track) => {
  postTrack(track);
  setTrack(track);
});

initFloater();
