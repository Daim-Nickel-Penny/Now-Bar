import type { Track } from "../track/track.ts";
import { sanitizeTrack } from "../track/sanitize-track.ts";

const TRACK_KEY = "nowPlaying";
const TAB_KEY = "sourceTabId";

export async function writeNowPlaying(track: Track | null, sourceTabId: number | undefined): Promise<void> {
  await chrome.storage.session.set({ [TRACK_KEY]: track, [TAB_KEY]: sourceTabId ?? null });
}

export async function readNowPlaying(): Promise<Track | null> {
  const bag = await chrome.storage.session.get(TRACK_KEY);
  return sanitizeTrack(bag[TRACK_KEY]);
}

export async function readSourceTabId(): Promise<number | null> {
  const bag = await chrome.storage.session.get(TAB_KEY);
  const value = bag[TAB_KEY];
  return typeof value === "number" ? value : null;
}

export async function forgetSourceTab(tabId: number): Promise<void> {
  if ((await readSourceTabId()) !== tabId) {
    return;
  }
  await chrome.storage.session.remove([TRACK_KEY, TAB_KEY]);
}
