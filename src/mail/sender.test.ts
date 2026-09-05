import { describe, expect, it } from "vitest";
import { isMailboxSender, isPanelSender, isSourceSender } from "./sender.ts";

const PANEL_ORIGIN = "chrome-extension://abcdefghijklmnopqrstuvwxyzabcdef";

describe("isSourceSender", () => {
  it("rejects http", () => {
    expect(isSourceSender("http://music.youtube.com/watch")).toBe(false);
    expect(isSourceSender("http://open.spotify.com/")).toBe(false);
  });

  it("rejects evil.com", () => {
    expect(isSourceSender("https://evil.com/")).toBe(false);
    expect(isSourceSender("https://music.youtube.com.evil.com/")).toBe(false);
    expect(isSourceSender("https://open.spotify.com.evil.com/")).toBe(false);
    expect(isSourceSender("https://evil.com/music.youtube.com")).toBe(false);
  });

  it("accepts music.youtube.com", () => {
    expect(isSourceSender("https://music.youtube.com/")).toBe(true);
    expect(isSourceSender("https://music.youtube.com/watch?v=abc")).toBe(true);
  });

  it("accepts open.spotify.com", () => {
    expect(isSourceSender("https://open.spotify.com/")).toBe(true);
    expect(isSourceSender("https://open.spotify.com/track/1")).toBe(true);
  });

  it("rejects credentials in the sender url", () => {
    expect(isSourceSender("https://user:pass@music.youtube.com/")).toBe(false);
    expect(isSourceSender("https://user@open.spotify.com/")).toBe(false);
    expect(isSourceSender("https://:secret@music.youtube.com/")).toBe(false);
  });

  it("rejects missing or unparsable urls", () => {
    expect(isSourceSender(undefined)).toBe(false);
    expect(isSourceSender("")).toBe(false);
    expect(isSourceSender("not-a-url")).toBe(false);
    expect(isSourceSender("ftp://music.youtube.com/")).toBe(false);
  });
});

describe("isPanelSender", () => {
  it("accepts an extension page under the panel origin", () => {
    expect(isPanelSender(`${PANEL_ORIGIN}/panel/panel.html`, PANEL_ORIGIN)).toBe(true);
  });

  it("rejects another origin or a prefix trick", () => {
    expect(isPanelSender("https://music.youtube.com/", PANEL_ORIGIN)).toBe(false);
    expect(isPanelSender(`${PANEL_ORIGIN}evil/panel.html`, PANEL_ORIGIN)).toBe(false);
    expect(
      isPanelSender("chrome-extension://otheridxxxxxxxxxxxxxxxxxxxx/panel.html", PANEL_ORIGIN),
    ).toBe(false);
    expect(isPanelSender(undefined, PANEL_ORIGIN)).toBe(false);
    expect(isPanelSender(`${PANEL_ORIGIN}/panel.html`, "")).toBe(false);
  });
});

describe("isMailboxSender", () => {
  it("accepts only the service worker of this extension", () => {
    expect(isMailboxSender("id", undefined, "id")).toBe(true);
    expect(isMailboxSender("id", 4, "id")).toBe(false);
    expect(isMailboxSender("other", undefined, "id")).toBe(false);
    expect(isMailboxSender(undefined, undefined, "id")).toBe(false);
  });
});
