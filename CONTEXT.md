# Now Bar

A local now-playing snapshot from a music tab, shown in a floating glass shell.

## Language

**NowPlaying**:
The latest validated track the service worker is holding for the Floater.
_Avoid_: current song, media info, metadata

**Track**:
A sanitized snapshot of title, artist, album, artwork, source, and whether it is playing.
_Avoid_: song, metadata, MediaMetadata

**Source**:
The music page a Track came from: YouTube Music or Spotify Web.
_Avoid_: provider, platform, service, API

**Artwork**:
The cover image URL on a Track, allowed only from a Source CDN hostname.
_Avoid_: thumbnail, album art, image, cover

**Floater**:
The Document Picture-in-Picture window that paints the NowPlaying.
_Avoid_: popup, overlay, widget, PiP player

**Owner**:
The extension page that is allowed to open and keep the Floater alive.
_Avoid_: background, offscreen, popup

**ShellVariant**:
How the Owner or Floater is laid out: Expanded, Pill, or Icon.
_Avoid_: size, mode, state, view

**Scene**:
One looping video the Floater is showing as the content layer.
_Avoid_: background, wallpaper, GIF, still

**ScenePlaylist**:
The ordered set of Scenes the Floater cycles. Only one Scene is decoded at a time.
_Avoid_: gallery, library, backgrounds, carousel
