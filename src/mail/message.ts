import type { Track } from "../track/track.ts";
import { sanitizeTrack } from "../track/sanitize-track.ts";

export type AdapterMail = { type: "track"; track: Track } | { type: "idle" };
export type PanelMail = { type: "requestTrack" } | { type: "openFloater" };
export type OwnerMail = { type: "openFloater" };
export type NowPlayingReply = { type: "nowPlaying"; track: Track | null; connected: boolean };

export function assertNever(value: never): never {
  throw new Error(`unexpected:${String(value)}`);
}

function mailRecord(input: unknown): Record<string, unknown> | null {
  if (input === null || typeof input !== "object") {
    return null;
  }
  return input as Record<string, unknown>;
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
      const track = sanitizeTrack(raw.track);
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

export function parsePanelMail(input: unknown): PanelMail | null {
  const raw = mailRecord(input);
  if (!raw) {
    return null;
  }
  const type = raw.type;
  if (type !== "requestTrack" && type !== "openFloater") {
    return null;
  }
  switch (type) {
    case "requestTrack":
      return { type: "requestTrack" };
    case "openFloater":
      return { type: "openFloater" };
    default:
      return assertNever(type);
  }
}

export function parseOwnerMail(input: unknown): OwnerMail | null {
  const raw = mailRecord(input);
  if (!raw || raw.type !== "openFloater") {
    return null;
  }
  return { type: "openFloater" };
}

export function parseNowPlayingReply(input: unknown): NowPlayingReply | null {
  const raw = mailRecord(input);
  if (!raw || raw.type !== "nowPlaying" || typeof raw.connected !== "boolean") {
    return null;
  }
  return { type: "nowPlaying", track: sanitizeTrack(raw.track), connected: raw.connected };
}
