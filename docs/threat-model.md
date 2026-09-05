# Threat model

## What this extension can see

Isolated adapters read the player bar on `https://music.youtube.com/*` and `https://open.spotify.com/*` only: title, artist, album, artwork URL, and whether media is playing.

## What it cannot see

Other tabs, cookies, history, accounts, native Spotify or YouTube apps, and any origin not listed above.

## What it stores

`chrome.storage.session` holds at most one NowPlaying key. It is gone when the Chrome session ends. Track text is never written to `storage.local`.

## What it sends

Nothing. No telemetry, crash reports, font CDNs, artwork proxies, or update pings. The mailbox never `fetch()`es a URL an adapter supplied. Artwork is an `<img>` in the Owner against a hostname allowlist.

## Hostile mail

Every `runtime.onMessage` is treated as attacker-controlled. Unknown types are dropped. The sender URL must be one of the two Source origins or an extension page. Content scripts cannot open tabs or trigger downloads.
