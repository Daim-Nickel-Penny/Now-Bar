# Now Bar

A local now-playing snapshot from a music tab, shown in a floating glass shell over a dotted ASCII scene.

## Language

**NowPlaying**:
The latest validated track the service worker is holding for the Panel.
_Avoid_: current song, media info, metadata

**Track**:
A sanitized snapshot of title, artist, album, artwork, source, and whether it is playing.
_Avoid_: song, metadata, MediaMetadata

**Source**:
The music page a Track came from: YouTube Music or Spotify Web.
_Avoid_: provider, platform, service, API

**Adapter**:
The content script for one Source. It reads the player bar, drives the Source's own buttons, and is the Owner of the Floater.
_Avoid_: scraper, injector, bridge

**SourceControls**:
The three page buttons an Adapter can press for the Floater: previous, play/pause, next.
_Avoid_: media keys, transport, remote

**Artwork**:
The cover image URL on a Track, allowed only from a Source CDN hostname.
_Avoid_: thumbnail, album art, image, cover

**Floater**:
The always-on-top Document Picture-in-Picture window that paints the Track over a Scene.
_Avoid_: popup, overlay, widget, PiP player

**Owner**:
The Source tab that opened the Floater and keeps it alive. Only the Adapter running there may call `requestWindow`.
_Avoid_: background, offscreen, popup

**Panel**:
The toolbar popup. It shows NowPlaying, edits Preferences, and asks the Owner to open the Floater.
_Avoid_: popup, options, settings page, dashboard

**TriggerPill**:
The small in-page button the Adapter shows when the Floater is closed and cannot open by itself.
_Avoid_: FAB, launcher, badge

**Preferences**:
What the user chose in the Panel: open on play, ASCII style, active Scenes, default ShellVariant. Lives in `chrome.storage.local`. Never holds Track text.
_Avoid_: settings, config, options

**ShellVariant**:
How the Floater is laid out: Expanded, Pill, or Icon.
_Avoid_: size, mode, state, view

**Scene**:
One seamless looping animation the Floater shows behind the glass: Scenery plus the Axolotl.
_Avoid_: background, wallpaper, GIF, still, video

**Scenery**:
The drawn backdrop of a Scene, rendered through asciify-engine as dots or glyphs.
_Avoid_: background, set, environment

**Axolotl**:
The solid pixel-art mascot painted on top of the Scenery, with an Activity per Scene.
_Avoid_: character, sprite, pet, mascot

**Activity**:
What the Axolotl is doing in a Scene: reading, dancing, sleeping, guitar, gaming, cooking.
_Avoid_: pose, animation, state

**AsciiStyle**:
How Scenery is rendered: Dots or Glyphs.
_Avoid_: render mode, theme, filter

**ScenePlaylist**:
The ordered set of active Scenes the Floater cycles. Only one Scene is drawn at a time.
_Avoid_: gallery, library, backgrounds, carousel
