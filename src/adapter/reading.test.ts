import { describe, expect, it } from "vitest";
import { SILENT, UNREADABLE, parsed, readingKey } from "./reading.ts";
import type { Track } from "../track/track.ts";

const song: Track = {
  source: "youtubeMusic",
  title: "Night Drive",
  artist: "Neon",
  album: null,
  artworkUrl: null,
  playing: true,
};

describe("parsed", () => {
  it("reads a bar that gave up its fields as a Track", () => {
    expect(parsed(song)).toEqual({ kind: "track", track: song });
  });

  it("reads a bar that parsed to nothing as selector rot, not as silence", () => {
    expect(parsed(null)).toEqual(UNREADABLE);
    expect(parsed(null)).not.toEqual(SILENT);
  });
});

describe("readingKey", () => {
  it("separates a missing bar from an unreadable one", () => {
    expect(readingKey(SILENT)).not.toBe(readingKey(UNREADABLE));
  });

  it("is stable for the same Track and changes when the Track does", () => {
    expect(readingKey(parsed(song))).toBe(readingKey(parsed({ ...song })));
    expect(readingKey(parsed(song))).not.toBe(readingKey(parsed({ ...song, playing: false })));
    expect(readingKey(parsed(song))).not.toBe(readingKey(parsed({ ...song, title: "Other" })));
  });
});
