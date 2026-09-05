import type { Track } from "../track/track.ts";
import { sanitizeTrack } from "../track/sanitize-track.ts";

export type AdapterMail = { type: "track"; track: Track } | { type: "idle" } | { type: "unreadable" };
export type PanelMail = { type: "requestTrack" } | { type: "openFloater" };
export type OwnerMail = { type: "openFloater" } | { type: "reportTrack" };
export type TrackReply = { type: "trackReply"; track: Track | null; readable: boolean };
export type NowPlayingReply = {
  type: "nowPlaying";
  track: Track | null;
  connected: boolean;
  /** False when a Source tab is there but its player bar no longer parses. */
  readable: boolean;
};

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
  if (type !== "track" && type !== "idle" && type !== "unreadable") {
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
    case "unreadable":
      return { type: "unreadable" };
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
  if (!raw) {
    return null;
  }
  const type = raw.type;
  if (type !== "openFloater" && type !== "reportTrack") {
    return null;
  }
  switch (type) {
    case "openFloater":
      return { type: "openFloater" };
    case "reportTrack":
      return { type: "reportTrack" };
    default:
      return assertNever(type);
  }
}

export function parseTrackReply(input: unknown): TrackReply | null {
  const raw = mailRecord(input);
  if (!raw || raw.type !== "trackReply" || typeof raw.readable !== "boolean") {
    return null;
  }
  return { type: "trackReply", track: sanitizeTrack(raw.track), readable: raw.readable };
}

export function parseNowPlayingReply(input: unknown): NowPlayingReply | null {
  const raw = mailRecord(input);
  if (
    !raw ||
    raw.type !== "nowPlaying" ||
    typeof raw.connected !== "boolean" ||
    typeof raw.readable !== "boolean"
  ) {
    return null;
  }
  return {
    type: "nowPlaying",
    track: sanitizeTrack(raw.track),
    connected: raw.connected,
    readable: raw.readable,
  };
}
