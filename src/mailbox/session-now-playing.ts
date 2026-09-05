import type { Track } from "../track/track.ts";
import { sanitizeTrack } from "../track/sanitize-track.ts";

/** Session key holding one entry per Source tab. Exported so the Panel can watch the same key. */
export const SESSION_SOURCE_KEY = "sources";

export type SourceEntry = { tabId: number; track: Track | null; readable: boolean; at: number };

/**
 * One slot per music tab. A single slot let a second tab overwrite the first, so the Panel and the
 * Floater could end up pointing at a tab that was not the one making sound.
 */
type SourceBag = Record<string, { track: unknown; readable?: unknown; at: unknown }>;

async function readBag(): Promise<SourceBag> {
  const bag = await chrome.storage.session.get(SESSION_SOURCE_KEY);
  const value = bag[SESSION_SOURCE_KEY];
  return value !== null && typeof value === "object" ? (value as SourceBag) : {};
}

function parseEntries(bag: SourceBag): SourceEntry[] {
  const entries: SourceEntry[] = [];
  for (const [key, value] of Object.entries(bag)) {
    const tabId = Number(key);
    if (!Number.isInteger(tabId) || value === null || typeof value !== "object") {
      continue;
    }
    entries.push({
      tabId,
      track: sanitizeTrack(value.track),
      readable: value.readable !== false,
      at: typeof value.at === "number" ? value.at : 0,
    });
  }
  return entries;
}

export async function writeNowPlaying(
  track: Track | null,
  readable: boolean,
  tabId: number | undefined,
): Promise<void> {
  if (tabId === undefined) {
    return;
  }
  const bag = await readBag();
  bag[String(tabId)] = { track, readable, at: Date.now() };
  await chrome.storage.session.set({ [SESSION_SOURCE_KEY]: bag });
}

/** A tab that is playing beats one that is merely loaded; otherwise the most recent wins. */
export function pickSource(entries: readonly SourceEntry[]): SourceEntry | null {
  const ranked = [...entries].sort((a, b) => {
    const playing = Number(b.track?.playing === true) - Number(a.track?.playing === true);
    if (playing !== 0) {
      return playing;
    }
    const known = Number(b.track !== null) - Number(a.track !== null);
    if (known !== 0) {
      return known;
    }
    /** A tab whose bar stopped parsing is a worse answer than one that is simply quiet. */
    const readable = Number(b.readable) - Number(a.readable);
    return readable !== 0 ? readable : b.at - a.at;
  });
  return ranked[0] ?? null;
}

export async function readSource(): Promise<SourceEntry | null> {
  return pickSource(parseEntries(await readBag()));
}

export async function readSourceTabIds(): Promise<number[]> {
  return parseEntries(await readBag()).map((entry) => entry.tabId);
}

export async function forgetSourceTab(tabId: number): Promise<void> {
  const bag = await readBag();
  const key = String(tabId);
  if (!(key in bag)) {
    return;
  }
  const rest = Object.fromEntries(Object.entries(bag).filter(([id]) => id !== key));
  await chrome.storage.session.set({ [SESSION_SOURCE_KEY]: rest });
}
