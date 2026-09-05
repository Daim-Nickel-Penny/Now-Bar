import { describe, expect, it } from "vitest";
import type { Track } from "../track/track.ts";
import {
  assertNever,
  parseAdapterMail,
  parseNowPlayingReply,
  parseOwnerMail,
  parsePanelMail,
  parseTrackReply,
} from "./message.ts";

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
    expect(parseAdapterMail({ type: "openFloater" })).toBeNull();
    expect(parseAdapterMail({ type: "requestTrack" })).toBeNull();
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
      parseAdapterMail({ type: "track", track: { ...youtubeTrack, source: "appleMusic" } }),
    ).toBeNull();
    expect(parseAdapterMail({ type: "track", track: { ...youtubeTrack, title: 12 } })).toBeNull();
    expect(parseAdapterMail({ type: "track", track: null })).toBeNull();
    expect(parseAdapterMail({ type: "track" })).toBeNull();
  });
});

describe("parsePanelMail", () => {
  it("drops unknown type", () => {
    expect(parsePanelMail({ type: "track", track: youtubeTrack })).toBeNull();
    expect(parsePanelMail({ type: "idle" })).toBeNull();
    expect(parsePanelMail({ type: "download" })).toBeNull();
    expect(parsePanelMail(null)).toBeNull();
  });

  it("accepts requestTrack and openFloater without extras", () => {
    expect(parsePanelMail({ type: "requestTrack", extra: true })).toEqual({
      type: "requestTrack",
    });
    expect(parsePanelMail({ type: "openFloater", tabId: 9 })).toEqual({ type: "openFloater" });
  });
});

describe("parseOwnerMail", () => {
  it("accepts the two things the mailbox may ask a Source tab to do", () => {
    expect(parseOwnerMail({ type: "openFloater" })).toEqual({ type: "openFloater" });
    expect(parseOwnerMail({ type: "reportTrack" })).toEqual({ type: "reportTrack" });
  });

  it("rejects anything else", () => {
    expect(parseOwnerMail({ type: "requestTrack" })).toBeNull();
    expect(parseOwnerMail({})).toBeNull();
    expect(parseOwnerMail(null)).toBeNull();
    expect(parseOwnerMail("openFloater")).toBeNull();
  });
});

describe("parseAdapterMail unreadable", () => {
  it("accepts the reading that says the player bar stopped parsing", () => {
    expect(parseAdapterMail({ type: "unreadable" })).toEqual({ type: "unreadable" });
  });
});

describe("parseTrackReply", () => {
  it("sanitizes the track a Source tab reports back", () => {
    expect(parseTrackReply({ type: "trackReply", track: youtubeTrack, readable: true })).toEqual({
      type: "trackReply",
      track: youtubeTrack,
      readable: true,
    });
  });

  it("reads silence as a reply with no track, not as a broken reply", () => {
    expect(parseTrackReply({ type: "trackReply", track: null, readable: true })).toEqual({
      type: "trackReply",
      track: null,
      readable: true,
    });
  });

  it("drops artwork from a host that is not a Source CDN", () => {
    const reply = parseTrackReply({
      type: "trackReply",
      track: { ...youtubeTrack, artworkUrl: "https://evil.example/pixel.png" },
      readable: true,
    });
    expect(reply?.track?.artworkUrl).toBeNull();
  });

  it("rejects a reply that is not one", () => {
    expect(parseTrackReply({ type: "nowPlaying", track: null, readable: true })).toBeNull();
    expect(parseTrackReply({ type: "trackReply", track: null })).toBeNull();
    expect(parseTrackReply(null)).toBeNull();
  });
});

describe("parseNowPlayingReply", () => {
  it("sanitizes the track and requires connected", () => {
    expect(
      parseNowPlayingReply({
        type: "nowPlaying",
        track: youtubeTrack,
        connected: true,
        readable: true,
      }),
    ).toEqual({ type: "nowPlaying", track: youtubeTrack, connected: true, readable: true });
    expect(
      parseNowPlayingReply({ type: "nowPlaying", track: null, connected: false, readable: true }),
    ).toEqual({ type: "nowPlaying", track: null, connected: false, readable: true });
    expect(parseNowPlayingReply({ type: "nowPlaying", track: null })).toBeNull();
    expect(parseNowPlayingReply({ type: "track", track: null, connected: true })).toBeNull();
  });

  it("carries an unreadable player bar through", () => {
    expect(
      parseNowPlayingReply({ type: "nowPlaying", track: null, connected: true, readable: false })
        ?.readable,
    ).toBe(false);
  });

  it("drops a reply whose flags are missing or the wrong shape", () => {
    expect(parseNowPlayingReply({ type: "nowPlaying", track: null, connected: true })).toBeNull();
    expect(
      parseNowPlayingReply({ type: "nowPlaying", track: null, connected: true, readable: "yes" }),
    ).toBeNull();
  });
});

describe("assertNever", () => {
  it("throws on an impossible value", () => {
    expect(() => assertNever("junk" as never)).toThrow("unexpected:");
  });
});
