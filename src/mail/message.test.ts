import { describe, expect, it } from "vitest";
import type { Track } from "../track/track.ts";
import { assertNever, parseAdapterMail, parseOwnerMail } from "./message.ts";

const youtubeTrack: Track = {
  source: "youtubeMusic",
  title: "Night Drive",
  artist: "Neon",
  album: "After Hours",
  artworkUrl: "https://i.ytimg.com/vi/abc/hqdefault.jpg",
  playing: true,
};

const spotifyTrack: Track = {
  source: "spotifyWeb",
  title: "Lobby",
  artist: "Desk",
  album: null,
  artworkUrl: null,
  playing: false,
};

describe("parseAdapterMail", () => {
  it("drops unknown type", () => {
    expect(parseAdapterMail({ type: "download" })).toBeNull();
    expect(parseAdapterMail({ type: "openTab" })).toBeNull();
    expect(parseAdapterMail({ type: "requestTrack" })).toBeNull();
    expect(parseAdapterMail({ type: "fetch" })).toBeNull();
    expect(parseAdapterMail({ type: 1 })).toBeNull();
    expect(parseAdapterMail(null)).toBeNull();
    expect(parseAdapterMail(undefined)).toBeNull();
    expect(parseAdapterMail("track")).toBeNull();
  });

  it("accepts a good track", () => {
    expect(parseAdapterMail({ type: "track", track: youtubeTrack })).toEqual({
      type: "track",
      track: youtubeTrack,
    });
    expect(parseAdapterMail({ type: "track", track: spotifyTrack })).toEqual({
      type: "track",
      track: spotifyTrack,
    });
  });

  it("strips extra fields on a good track", () => {
    expect(
      parseAdapterMail({
        type: "track",
        extra: true,
        track: { ...youtubeTrack, injected: "xss" },
      }),
    ).toEqual({ type: "track", track: youtubeTrack });
  });

  it("accepts idle", () => {
    expect(parseAdapterMail({ type: "idle" })).toEqual({ type: "idle" });
    expect(parseAdapterMail({ type: "idle", extra: true })).toEqual({ type: "idle" });
  });

  it("drops a track with a broken shape", () => {
    expect(
      parseAdapterMail({
        type: "track",
        track: { ...youtubeTrack, source: "appleMusic" },
      }),
    ).toBeNull();
    expect(
      parseAdapterMail({
        type: "track",
        track: { ...youtubeTrack, title: 12 },
      }),
    ).toBeNull();
    expect(parseAdapterMail({ type: "track", track: null })).toBeNull();
    expect(parseAdapterMail({ type: "track" })).toBeNull();
  });
});

describe("parseOwnerMail", () => {
  it("drops unknown type", () => {
    expect(parseOwnerMail({ type: "track", track: youtubeTrack })).toBeNull();
    expect(parseOwnerMail({ type: "idle" })).toBeNull();
    expect(parseOwnerMail({ type: "download" })).toBeNull();
    expect(parseOwnerMail(null)).toBeNull();
  });

  it("accepts requestTrack", () => {
    expect(parseOwnerMail({ type: "requestTrack" })).toEqual({ type: "requestTrack" });
    expect(parseOwnerMail({ type: "requestTrack", extra: true })).toEqual({
      type: "requestTrack",
    });
  });
});

describe("assertNever", () => {
  it("throws on an impossible value", () => {
    expect(() => assertNever("junk" as never)).toThrow("unexpected");
  });
});
