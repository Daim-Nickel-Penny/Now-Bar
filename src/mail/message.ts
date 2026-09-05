import type { Track } from "../track/track.ts";

export type AdapterMail = { type: "track"; track: Track } | { type: "idle" };
export type OwnerMail = { type: "requestTrack" };
export type Mail = AdapterMail | OwnerMail;

export function assertNever(value: never): never {
  throw new Error("unexpected");
}

function mailRecord(input: unknown): Record<string, unknown> | null {
  if (input === null || typeof input !== "object") {
    return null;
  }
  return input as Record<string, unknown>;
}

function trackFromUnknown(input: unknown): Track | null {
  const raw = mailRecord(input);
  if (!raw) {
    return null;
  }
  if (raw.source !== "youtubeMusic" && raw.source !== "spotifyWeb") {
    return null;
  }
  if (typeof raw.title !== "string") {
    return null;
  }
  if (typeof raw.artist !== "string") {
    return null;
  }
  if (raw.album !== null && typeof raw.album !== "string") {
    return null;
  }
  if (raw.artworkUrl !== null && typeof raw.artworkUrl !== "string") {
    return null;
  }
  if (typeof raw.playing !== "boolean") {
    return null;
  }
  return {
    source: raw.source,
    title: raw.title,
    artist: raw.artist,
    album: raw.album,
    artworkUrl: raw.artworkUrl,
    playing: raw.playing,
  };
}

export function parseAdapterMail(input: unknown): AdapterMail | null {
  const raw = mailRecord(input);
  if (!raw) {
    return null;
  }
  const type = raw.type;
  if (type !== "track" && type !== "idle") {
    return null;
  }
  switch (type) {
    case "track": {
      const track = trackFromUnknown(raw.track);
      if (!track) {
        return null;
      }
      return { type: "track", track };
    }
    case "idle":
      return { type: "idle" };
    default:
      return assertNever(type);
  }
}

export function parseOwnerMail(input: unknown): OwnerMail | null {
  const raw = mailRecord(input);
  if (!raw) {
    return null;
  }
  const type = raw.type;
  if (type !== "requestTrack") {
    return null;
  }
  switch (type) {
    case "requestTrack":
      return { type: "requestTrack" };
    default:
      return assertNever(type);
  }
}
