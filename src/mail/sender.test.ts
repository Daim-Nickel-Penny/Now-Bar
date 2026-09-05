import { describe, expect, it } from "vitest";
import { isOwnerSender, isSourceSender } from "./sender.ts";

const OWNER_ORIGIN = "chrome-extension://abcdefghijklmnopqrstuvwxyzabcdef";

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

describe("isOwnerSender", () => {
  it("accepts an extension page under the owner origin", () => {
    expect(isOwnerSender(`${OWNER_ORIGIN}/owner.html`, OWNER_ORIGIN)).toBe(true);
    expect(isOwnerSender(OWNER_ORIGIN, OWNER_ORIGIN)).toBe(true);
  });

  it("rejects another origin", () => {
    expect(isOwnerSender("https://music.youtube.com/", OWNER_ORIGIN)).toBe(false);
    expect(
      isOwnerSender("chrome-extension://otheridxxxxxxxxxxxxxxxxxxxx/owner.html", OWNER_ORIGIN),
    ).toBe(false);
    expect(isOwnerSender(undefined, OWNER_ORIGIN)).toBe(false);
    expect(isOwnerSender(`${OWNER_ORIGIN}/owner.html`, "")).toBe(false);
  });
});
