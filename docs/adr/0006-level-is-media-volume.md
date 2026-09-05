# 0006. Level is media.volume, not a page form write

## Status

Accepted

## Context

The Floater needs to change how loud the Source tab is. The obvious move is to find the site's volume slider and dispatch `input` / `change`. Document PiP is same-origin with that tab, so page script can also fire those events on our own range. A loose selector, or a page that moved markup, could write a search box or any other field.

Vendor volume APIs need tokens. MAIN-world hooks are out of scope.

## Decision

Mute is a `.click()` on the Source mute button, the same way previous / play / next work. Level is `HTMLMediaElement.volume` and `.muted` on `video` / `audio` in the Owner document. The value is a finite number clamped to 0–1. Nudges move one step. Level is not a Track field, not Mail, and not a Preference.

SourceControls never writes page form fields and never dispatches input events on the Source UI.

## Consequences

The site's own slider may not move. Spotify via Web Audio may ignore `media.volume`; mute still works through the page button. The page can poke the Floater DOM, but every Level write is clamped and stays on media elements.
