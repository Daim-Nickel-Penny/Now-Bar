import { describe, expect, test } from "vitest"
import { sanitizeTrack } from "./sanitize-track"
import type { Track } from "./track"

const ytm: Track = {
  source: "youtubeMusic",
  title: "Night Drive",
  artist: "Kavinsky",
  album: "OutRun",
  artworkUrl: "https://lh3.googleusercontent.com/artwork/night-drive",
  playing: true,
}

const spotify: Track = {
  source: "spotifyWeb",
  title: "Blinding Lights",
  artist: "The Weeknd",
  album: "After Hours",
  artworkUrl: "https://i.scdn.co/image/ab67616d0000b273",
  playing: false,
}

describe("sanitizeTrack", () => {
  test("keeps a YouTube Music Track with googleusercontent artwork", () => {
    expect(sanitizeTrack(ytm)).toEqual(ytm)
  })

  test("keeps YouTube Music artwork on i.ytimg.com and ggpht", () => {
    const ytimg = "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    const ytimgSuffix = "https://i9.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    const ggpht = "https://yt3.ggpht.com/channel/photo"
    const lh4 = "https://lh4.googleusercontent.com/artwork/night-drive"
    expect(sanitizeTrack({ ...ytm, artworkUrl: ytimg })?.artworkUrl).toBe(ytimg)
    expect(sanitizeTrack({ ...ytm, artworkUrl: ytimgSuffix })?.artworkUrl).toBe(
      ytimgSuffix,
    )
    expect(sanitizeTrack({ ...ytm, artworkUrl: ggpht })?.artworkUrl).toBe(ggpht)
    expect(sanitizeTrack({ ...ytm, artworkUrl: lh4 })?.artworkUrl).toBe(lh4)
  })

  test("keeps a Spotify Track with i.scdn.co artwork", () => {
    expect(sanitizeTrack(spotify)).toEqual(spotify)
  })

  test("keeps Spotify artwork on mosaic.scdn.co and spotifycdn.com", () => {
    const mosaic = "https://mosaic.scdn.co/640/ab67616d"
    const cdn = "https://image-cdn-ak.spotifycdn.com/image/ab67616d"
    expect(sanitizeTrack({ ...spotify, artworkUrl: mosaic })?.artworkUrl).toBe(
      mosaic,
    )
    expect(sanitizeTrack({ ...spotify, artworkUrl: cdn })?.artworkUrl).toBe(cdn)
  })

  test("rejects data: javascript: and blob: artwork", () => {
    expect(
      sanitizeTrack({ ...ytm, artworkUrl: "data:image/png;base64,abc" })
        ?.artworkUrl,
    ).toBeNull()
    expect(
      sanitizeTrack({ ...ytm, artworkUrl: "javascript:alert(1)" })?.artworkUrl,
    ).toBeNull()
    expect(
      sanitizeTrack({
        ...ytm,
        artworkUrl: "blob:https://i.scdn.co/4d2f",
      })?.artworkUrl,
    ).toBeNull()
  })

  test("rejects http artwork", () => {
    expect(
      sanitizeTrack({
        ...spotify,
        artworkUrl: "http://i.scdn.co/image/ab67616d",
      })?.artworkUrl,
    ).toBeNull()
  })

  test("rejects artwork with username or password", () => {
    expect(
      sanitizeTrack({
        ...spotify,
        artworkUrl: "https://user:secret@i.scdn.co/image/ab67616d",
      })?.artworkUrl,
    ).toBeNull()
  })

  test("rejects unknown artwork hosts", () => {
    expect(
      sanitizeTrack({
        ...ytm,
        artworkUrl: "https://cdn.example.com/cover.jpg",
      })?.artworkUrl,
    ).toBeNull()
    expect(
      sanitizeTrack({
        ...spotify,
        artworkUrl: "https://evil.i.scdn.co/image/ab67616d",
      })?.artworkUrl,
    ).toBeNull()
  })

  test("returns null when title is empty after trim", () => {
    expect(sanitizeTrack({ ...ytm, title: "" })).toBeNull()
    expect(sanitizeTrack({ ...ytm, title: "   " })).toBeNull()
  })

  test("strips control characters from title artist and album", () => {
    const dirty = {
      ...ytm,
      title: "Hel\u0000lo",
      artist: "Kav\u0007insky",
      album: "Out\u001FRun",
    }
    expect(sanitizeTrack(dirty)).toEqual({
      ...ytm,
      title: "Hello",
      artist: "Kavinsky",
      album: "OutRun",
    })
  })

  test("truncates title artist and album to 200 characters", () => {
    const title = "T".repeat(201)
    const artist = "A".repeat(201)
    const album = "L".repeat(201)
    const got = sanitizeTrack({ ...ytm, title, artist, album })
    expect(got?.title).toBe("T".repeat(200))
    expect(got?.artist).toBe("A".repeat(200))
    expect(got?.album).toBe("L".repeat(200))
  })

  test("treats missing album as null and missing playing as false", () => {
    expect(
      sanitizeTrack({
        source: "youtubeMusic",
        title: "Solo",
        artist: "",
      }),
    ).toEqual({
      source: "youtubeMusic",
      title: "Solo",
      artist: "",
      album: null,
      artworkUrl: null,
      playing: false,
    })
  })
})
