export type SourceId = "youtubeMusic" | "spotifyWeb"

export type Track = {
  source: SourceId
  title: string
  artist: string
  album: string | null
  artworkUrl: string | null
  playing: boolean
}
