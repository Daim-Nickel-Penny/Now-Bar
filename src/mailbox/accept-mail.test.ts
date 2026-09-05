import { describe, expect, it } from "vitest";
import { acceptAdapterMail, acceptPanelMail } from "./accept-mail.ts";

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
    expect(acceptAdapterMail({ type: "track", track }, "https://open.spotify.com/")).toEqual({
      type: "track",
      track,
    });
    expect(acceptAdapterMail({ type: "idle" }, "https://evil.com/")).toBeNull();
    expect(acceptAdapterMail({ type: "track", track }, undefined)).toBeNull();
  });
});

describe("acceptPanelMail", () => {
  const origin = "chrome-extension://id";

  it("keeps panel mail only from the panel", () => {
    expect(acceptPanelMail({ type: "requestTrack" }, `${origin}/panel/panel.html`, origin)).toEqual(
      { type: "requestTrack" },
    );
    expect(acceptPanelMail({ type: "openFloater" }, `${origin}/panel/panel.html`, origin)).toEqual(
      { type: "openFloater" },
    );
    expect(acceptPanelMail({ type: "openFloater" }, "https://open.spotify.com/", origin)).toBeNull();
  });
});
