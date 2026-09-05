# Docs

Open the one you need. Skip the rest.

## Start here

- [Add a scene](./add-a-scene.md) — how ASCII Scenes are painted, and the steps to add one
- [Contribute](../CONTRIBUTING.md) — security, privacy, performance, then how to work here
- [Install](../README.md#install) — load `dist/` in Chrome

## Product

- [Privacy](./privacy.md) — what it can see, store, and must never send
- [Words](../CONTEXT.md) — names used in file and folder names

## Decisions

Why, not how.

- [0001](./adr/0001-no-vendor-apis.md) — Track comes from the page, not vendor APIs
- [0002](./adr/0002-pip-owner.md) — the music tab owns the floating window
- [0003](./adr/0003-asciify-video-loops.md) — Scenes drawn per frame through asciify-engine
- [0004](./adr/0004-no-telemetry.md) — now-playing never leaves the machine
- [0005](./adr/0005-preferences-local.md) — Preferences in `storage.local`, never a Track
- [0006](./adr/0006-level-is-media-volume.md) — Level is media.volume, never a page form write
- [0007](./adr/0007-false-screen.md) — the glass sits on a FalseScreen, not on the Scene
