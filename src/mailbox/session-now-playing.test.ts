import { describe, expect, it } from "vitest";
import { pickSource, type SourceEntry } from "./session-now-playing.ts";
import type { Track } from "../track/track.ts";

function track(title: string, playing: boolean): Track {
  return {
    source: "spotifyWeb",
    title,
    artist: "",
    album: null,
    artworkUrl: null,
    playing,
  };
}

describe("pickSource", () => {
  it("has no source when no tab has reported", () => {
    expect(pickSource([])).toBeNull();
  });

  it("prefers the tab that is playing over a newer idle tab", () => {
    const entries: SourceEntry[] = [
      { tabId: 1, track: track("older but playing", true), readable: true, at: 100 },
      { tabId: 2, track: track("newer but paused", false), readable: true, at: 900 },
    ];
    expect(pickSource(entries)?.tabId).toBe(1);
  });

  it("prefers a tab with a track over one that only reported silence", () => {
    const entries: SourceEntry[] = [
      { tabId: 1, track: null, readable: true, at: 900 },
      { tabId: 2, track: track("loaded", false), readable: true, at: 100 },
    ];
    expect(pickSource(entries)?.tabId).toBe(2);
  });

  it("falls back to the most recent when both are playing", () => {
    const entries: SourceEntry[] = [
      { tabId: 1, track: track("first", true), readable: true, at: 100 },
      { tabId: 2, track: track("second", true), readable: true, at: 900 },
    ];
    expect(pickSource(entries)?.tabId).toBe(2);
  });

  it("prefers a readable tab over one whose bar stopped parsing", () => {
    const entries: SourceEntry[] = [
      { tabId: 1, track: null, readable: false, at: 900 },
      { tabId: 2, track: null, readable: true, at: 100 },
    ];
    expect(pickSource(entries)?.tabId).toBe(2);
  });

  it("leaves the caller's array alone", () => {
    const entries: SourceEntry[] = [
      { tabId: 1, track: track("a", false), readable: true, at: 1 },
      { tabId: 2, track: track("b", true), readable: true, at: 2 },
    ];
    pickSource(entries);
    expect(entries.map((e) => e.tabId)).toEqual([1, 2]);
  });
});
