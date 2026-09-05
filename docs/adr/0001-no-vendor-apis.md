# 0001. Read NowPlaying from the page, not vendor APIs

## Status

Accepted

## Context

YouTube and Spotify official APIs need OAuth, remote calls, and extra host permissions. The music tab already has the Track in its player bar.

## Decision

Isolated-world content scripts on `music.youtube.com` and `open.spotify.com` read the DOM and post a sanitized Track. No MAIN-world probe and no vendor APIs in v1.

## Consequences

Selectors will break when those sites change markup. Fixes stay inside one adapter file per Source. The extension never receives tokens or browsing data from other origins.
