# 0003. Scenes are drawn per frame through asciify-engine

## Status

Accepted (supersedes the `asciifyVideo` decoder)

## Context

Claude FM-style motion is a dotted ASCII room with a solid pixel mascot. The first cut fed a `captureStream` canvas into a hidden `<video>` and `asciifyVideo`. Inside a Document PiP window the video never reliably decoded, `asciifyVideo` threw, and the fallback painted a raw canvas, so no ASCII ever showed.

[asciify-engine](https://asciify.org/) also exports the synchronous pair `imageToAsciiFrame` and `renderFrameToCanvas`, which take a canvas and return a frame with no video involved.

## Decision

Each frame: the Scenery draws into a small offscreen canvas with a phase in `[0, 1)`; `imageToAsciiFrame` samples it; `renderFrameToCanvas` paints dots or glyphs onto the visible canvas; the Axolotl is painted last, in solid pixels aligned to the ASCII cell grid.

Every Scenery motion is a function of the phase using integer frequencies, so the loop is seamless. The frame rate is capped at 20 fps. `prefers-reduced-motion` freezes the phase at zero. The loop stops when the Floater is collapsed or hidden.

Only one Scene runs at a time. Scene changes dip the canvas opacity for 400 ms, swap, and fade back.

## Consequences

Adapter chunks include asciify-engine. Memory stays flat: two canvases and one frame array. No `<video>`, no `captureStream`, no web-accessible scene assets.
