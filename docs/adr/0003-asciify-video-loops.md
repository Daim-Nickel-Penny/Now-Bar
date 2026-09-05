# 0003. Scene loops go through asciify-engine video

## Status

Accepted

## Context

Claude FM-style motion is a looping scene, not a still. [asciify-engine](https://asciify.org/) already converts a live video element to ASCII or dots. Hand-rolled dither would duplicate that work at lower quality.

## Decision

The Floater plays a ScenePlaylist of distinct looping videos, not one Scene forever. Each Scene is a hidden (but decoded) `<video>` fed by a source canvas `captureStream` or a short muted `webm`. `asciifyVideo` renders it with `renderMode: "dots"` and `colorMode: "fullcolor"`.

Only one Scene is decoded. The next plate/video preloads after the current loop starts, then we swap at a loop boundary with a short crossfade. The decoder stops when the shell is collapsed, hidden, or `prefers-reduced-motion` is on.

## Consequences

The player chunk includes asciify-engine. Live streaming keeps memory flat (no pre-extracted frame arrays, no eight parallel videos). `display: none` on the backing video is forbidden; it stays in-tree at real size with opacity 0.
