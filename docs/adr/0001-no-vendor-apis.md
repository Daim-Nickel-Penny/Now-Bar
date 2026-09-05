# 0001. Read NowPlaying from the page, not vendor APIs

## Status

Accepted

## Context

YouTube and Spotify official APIs need OAuth, remote calls, and extra host permissions. The music tab already has the Track in its player bar.

## Decision

Isolated-world content scripts on `music.youtube.com` and `open.spotify.com` read the DOM and post a sanitized Track. Playback is the page's own buttons plus `HTMLMediaElement` Level. No MAIN-world probe and no vendor APIs.

## Consequences

Selectors will break when those sites change markup. Fixes stay inside one adapter file per Source. The extension never receives tokens or browsing data from other origins. Level stays on the tab's media elements; see [0006](./0006-level-is-media-volume.md).
