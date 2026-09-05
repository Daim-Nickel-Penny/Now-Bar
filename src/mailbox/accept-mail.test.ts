import { describe, expect, it } from "vitest";
import { acceptAdapterMail, acceptOwnerMail } from "./accept-mail.ts";

const track = {
  source: "spotifyWeb" as const,
  title: "T",
  artist: "Yuuki Matthews",
  album: null,
  artworkUrl: "https://i.scdn.co/image/ab",
  playing: true,
};

describe("acceptAdapterMail", () => {
  it("keeps mail only from source origins", () => {
    expect(
      acceptAdapterMail({ type: "track", track }, "https://open.spotify.com/"),
    ).toEqual({ type: "track", track });
    expect(acceptAdapterMail({ type: "idle" }, "https://evil.com/")).toBeNull();
    expect(acceptAdapterMail({ type: "track", track }, undefined)).toBeNull();
  });
});

describe("acceptOwnerMail", () => {
  const origin = "chrome-extension://id";

  it("keeps requestTrack only from the owner", () => {
    expect(
      acceptOwnerMail({ type: "requestTrack" }, `${origin}/owner/owner.html`, origin),
    ).toEqual({ type: "requestTrack" });
    expect(
      acceptOwnerMail({ type: "requestTrack" }, "https://open.spotify.com/", origin),
    ).toBeNull();
  });
});
