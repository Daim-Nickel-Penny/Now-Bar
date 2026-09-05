# 0002. The Adapter in the Source tab owns the Floater

## Status

Accepted (supersedes the extension-page Owner)

## Context

`documentPictureInPicture.requestWindow()` needs transient user activation on a visible, top-level document, and the Floater closes when its opener document goes away. A toolbar popup closes on blur, a service worker has no window, and an extension popup window forced a second click and a stray window.

The user already clicks inside the Source tab to press play. That click is activation the Adapter can spend.

## Decision

The Adapter is the Owner. When a Track flips to playing while `navigator.userActivation.isActive` is true and Preferences say open on play, the Adapter opens the Floater. If activation is missing (autoplay, queue advance), the Adapter shows the TriggerPill instead; clicking it opens the Floater.

The Panel never opens the Floater itself. Its Open button sends `openFloater` to the service worker, which forwards it to the Source tab and focuses that tab. The Adapter opens the Floater if it still has activation, otherwise shows the TriggerPill.

The Floater document is `about:blank` under the Source origin, so the Source CSP applies. Styles go in through `adoptedStyleSheets`, never inline `<style>`. No web fonts; the shell uses the system UI stack.

## Consequences

Closing or navigating the Source tab closes the Floater. Native Spotify and YouTube desktop apps are out of scope. Document PiP is always-on-top on desktop Chrome 116+.
