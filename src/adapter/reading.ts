import type { Track } from "../track/track.ts";

/**
 * One look at the player bar.
 *
 * `unreadable` is the case worth naming: the bar is on the page but its fields did not parse, which
 * means the Source changed its markup. Folding that into `silent` is what makes selector rot look
 * like an empty player, so the Panel blames the music instead of the extension.
 */
export type Reading =
  | { kind: "track"; track: Track }
  | { kind: "silent" }
  | { kind: "unreadable" };

export const SILENT: Reading = { kind: "silent" };
export const UNREADABLE: Reading = { kind: "unreadable" };

/** The bar was found; whether it parsed decides between a Track and selector rot. */
export function parsed(track: Track | null): Reading {
  return track === null ? UNREADABLE : { kind: "track", track };
}

export function readingKey(reading: Reading): string {
  if (reading.kind !== "track") {
    return reading.kind;
  }
  const { track } = reading;
  return [
    "track",
    track.source,
    track.title,
    track.artist,
    track.album ?? "",
    track.artworkUrl ?? "",
    track.playing ? "1" : "0",
  ].join("\u001f");
}
