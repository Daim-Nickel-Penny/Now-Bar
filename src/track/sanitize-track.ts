import type { SourceId, Track } from "./track"

const TEXT_MAX = 200
const CONTROL_CHARS = /[\u0000-\u001F]/g

export function sanitizeTrack(input: unknown): Track | null {
  if (input === null || typeof input !== "object") return null
  const raw = input as Record<string, unknown>
  if (!isSourceId(raw.source)) return null
  if (typeof raw.title !== "string") return null
  const playing = sanitizePlaying(raw.playing)
  if (playing === null) return null
  const title = cleanText(raw.title)
  if (title === "") return null
  return {
    source: raw.source,
    title,
    artist: typeof raw.artist === "string" ? cleanText(raw.artist) : "",
    album: sanitizeAlbum(raw.album),
    artworkUrl: sanitizeArtworkUrl(raw.artworkUrl),
    playing,
  }
}

function isSourceId(value: unknown): value is SourceId {
  return value === "youtubeMusic" || value === "spotifyWeb"
}

function sanitizePlaying(value: unknown): boolean | null {
  if (value === undefined) return false
  if (typeof value === "boolean") return value
  return null
}

function cleanText(value: string): string {
  return value.replace(CONTROL_CHARS, "").trim().slice(0, TEXT_MAX)
}

function sanitizeAlbum(value: unknown): string | null {
  if (typeof value !== "string") return null
  const album = cleanText(value)
  return album === "" ? null : album
}

function sanitizeArtworkUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (trimmed === "") return null
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }
  if (url.protocol !== "https:") return null
  if (url.username !== "" || url.password !== "") return null
  if (!artworkHostAllowed(url.hostname)) return null
  return url.href
}

function artworkHostAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase()
  if (host === "i.scdn.co" || host === "mosaic.scdn.co") return true
  if (host.endsWith(".spotifycdn.com")) return true
  if (host === "i.ytimg.com" || host.endsWith(".ytimg.com")) return true
  if (
    host === "lh3.googleusercontent.com" ||
    host.endsWith(".googleusercontent.com")
  ) {
    return true
  }
  if (host.endsWith(".ggpht.com")) return true
  return false
}
