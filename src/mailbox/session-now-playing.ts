import type { Track } from "../track/track.ts";

const KEY = "nowPlaying";

export async function writeNowPlaying(track: Track | null): Promise<void> {
  await chrome.storage.session.set({ [KEY]: track });
}

export async function readNowPlaying(): Promise<Track | null> {
  const bag = await chrome.storage.session.get(KEY);
  const value = bag[KEY];
  return value === undefined ? null : (value as Track);
}
