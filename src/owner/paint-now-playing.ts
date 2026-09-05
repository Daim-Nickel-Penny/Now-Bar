import type { Track } from "../track/track.ts";

export function paintNowPlaying(
  title: HTMLElement,
  artist: HTMLElement,
  art: HTMLImageElement,
  track: Track | null,
): void {
  if (track === null) {
    title.textContent = "Nothing playing";
    artist.textContent = "";
    art.removeAttribute("src");
    art.alt = "";
    return;
  }
  title.textContent = track.title;
  artist.textContent = track.artist;
  if (track.artworkUrl === null) {
    art.removeAttribute("src");
    art.alt = "";
    return;
  }
  art.alt = "";
  art.src = track.artworkUrl;
}
