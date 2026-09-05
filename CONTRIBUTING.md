# Contribute

Security and privacy come first. A smaller, quieter extension beats a clever one that phones home.

## Security and privacy

Nothing leaves the machine. That is the product, not a slogan.

What this repo already does, and what a change must keep:

| Rule | How |
| --- | --- |
| Least permission | Manifest asks for `storage` and `scripting` only. No `tabs`, no `<all_urls>`, no extra hosts. `scripting` re-injects the adapter after an update. |
| Two sites, isolated | Content scripts run only on YouTube Music and Spotify Web, in the isolated world. No MAIN-world injection. |
| No vendor APIs | The player bar on the page is the source. No OAuth, no tokens, no official music APIs. |
| No network of our own | No `fetch` to a backend, no analytics, no crash reporter, no font CDN, no update ping, no artwork proxy. |
| Track is sanitized | Title and artist are stripped of control characters and capped. Artwork must be `https` on a known CDN host, with no userinfo in the URL. |
| Track is brief | At most one snapshot in `chrome.storage.session`. It dies with the Chrome session. `storage.local` holds Preferences only — never track text, never Level. |
| Mail is hostile | Unknown message types are dropped. Sender URL must be one of the two music origins or an extension page. Never fetch a URL the page supplied. There is no Level mail. |
| Tight pages | Extension pages use a strict CSP. Images may load from the artwork allowlist. `connect-src` is `'self'`. |
| Small surface | Content scripts do not open tabs or start downloads. |
| Level stays local | Mute is a click on a button. Level is `media.volume` on that tab, clamped 0–1. Never write page form fields. Never store it. |

The full map is [docs/privacy.md](docs/privacy.md). The decisions behind it are [ADR 0001](docs/adr/0001-no-vendor-apis.md), [ADR 0004](docs/adr/0004-no-telemetry.md), and [ADR 0006](docs/adr/0006-level-is-media-volume.md).

A change that adds a permission, a remote call, a new origin, MAIN-world script, lasting track storage, Level storage, or writes page form fields needs a new ADR. Do not sneak it in beside a scene.

## Keep it light

The floating window is always on top. Waste there is visible.

- One Scene at a time. No videos, no `captureStream`, no image assets for rooms — draw, then asciify.
- The Scene fills the leftover stage. The glass sits on a FalseScreen, painted once on resize, never
  on the Scene loop.
- Cap the loop at about 20 fps. Stop it when the window is collapsed or closed.
- Honour `prefers-reduced-motion`: freeze the phase, still show the room.
- Coalesce player-bar reads. Do not scan the page on every mutation.
- Keep source canvases small. The Scene loop stays two canvases and one ASCII frame. The FalseScreen
  is a third canvas, still.
- One idea per file, under 200 lines.

## Add a scene

The recipe is [docs/add-a-scene.md](docs/add-a-scene.md). That is the only how-to. Follow it, then run:

```bash
npm test
npm run typecheck
npm run lint
```

## Everyday

```bash
npm install
npm run build
```

Load `dist/` in `chrome://extensions` (Developer mode → Load unpacked). After a code change: build, reload the extension card, refresh the music tab.

Words used in file and folder names are in [CONTEXT.md](CONTEXT.md).

## Docs

[docs/README.md](docs/README.md) is the index.
