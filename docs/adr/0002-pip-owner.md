# 0002. The Owner page opens the Floater

## Status

Accepted

## Context

`documentPictureInPicture.requestWindow()` needs a user gesture on a visible document. Service workers and offscreen documents cannot own a real Floater.

## Decision

The toolbar click opens `player.html` (the Owner). A click inside the Owner opens the Floater. The service worker only stores and forwards NowPlaying.

## Consequences

Closing the Owner closes the Floater. Native Spotify and YouTube desktop apps are out of scope.
