import type { Track } from "../track/track.ts";
import type { FloaterShell } from "./floater-shell.ts";
import { setIcon } from "./paint-icon.ts";

const SOURCE_NAME = { youtubeMusic: "YouTube Music", spotifyWeb: "Spotify" } as const;

function paintArt(img: HTMLImageElement, url: string | null): void {
  if (url === null) {
    img.removeAttribute("src");
    return;
  }
  if (img.getAttribute("src") !== url) {
    img.src = url;
  }
}

export function paintNowPlaying(shell: FloaterShell, track: Track | null): void {
  const playing = track?.playing === true;
  shell.root.dataset.playing = playing ? "true" : "false";
  setIcon(shell.play, playing ? "pause" : "play");
  shell.play.setAttribute("aria-label", playing ? "Pause" : "Play");
  if (track === null) {
    shell.title.textContent = "Nothing playing";
    shell.artist.textContent = "Press play in your music tab";
    paintArt(shell.art, null);
    paintArt(shell.artMini, null);
    return;
  }
  shell.title.textContent = track.title;
  shell.artist.textContent = track.artist === "" ? SOURCE_NAME[track.source] : track.artist;
  shell.title.title = track.title;
  paintArt(shell.art, track.artworkUrl);
  paintArt(shell.artMini, track.artworkUrl);
}
