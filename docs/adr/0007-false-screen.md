# 0007. The glass sits on a FalseScreen, not on the Scene

## Status

Accepted (supersedes composing the room above a SceneGutter)

## Context

The glass card was absolutely positioned over the Scene. The paint path reserved a bottom band,
compressed the room into the leftover height, and stretched the last floor row through the overlap so
the card would not sit on empty black. On a short Floater a media query hid the Scene, so the room
disappeared under the track.

That made the card a participant in Scene composition. Dragging the window changed the room, not
just the viewport, and a small Floater had no Scene at all.

## Decision

The Floater is a column. The Scene canvas fills the leftover height and paints its full surface. The
glass lives in a FalseScreen below it: a still, scene-agnostic ambient, painted only on resize. The
Scene loop does not measure the card.

Pill hides the Scene and keeps the card. Icon hides the FalseScreen as well.

## Consequences

Dragging the Floater shorter shrinks the Scene instead of covering it. Scene authors compose to the
canvas they are given; they do not reserve space for the card. One extra canvas, still, not on the
15 fps path.
