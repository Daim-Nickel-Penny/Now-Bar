# Privacy

## What it can see

The extension reads the player bar on `https://music.youtube.com/*` and `https://open.spotify.com/*` only: title, artist, album, artwork URL, and whether something is playing.

## Why it asks for those two hosts

`host_permissions` lists the same two origins the content scripts already run on. The mailbox needs
them to find the music tabs (`tabs.query`) and to speak to its own content script in them
(`tabs.sendMessage`); without them the Panel cannot tell a tab that is playing from no tab at all.
It grants nothing beyond those two origins, and the install prompt is the one the content scripts
already produced.

`scripting` is used for exactly one thing: after an install or an update, re-running the adapter in
music tabs that were already open. Chrome leaves those tabs with a dead content script otherwise. It
can only inject into the two origins above, and only the adapter files listed in the manifest.

## What it cannot see

Other tabs, cookies, history, accounts, native Spotify or YouTube apps, and any site not listed above.

## What it stores

`chrome.storage.session` holds one now-playing snapshot per music tab, keyed by tab id, plus whether
that tab's player bar still parses, and drops a tab's entry as soon as it closes or stops answering. It is gone when the Chrome session ends.

`chrome.storage.local` holds Preferences and the size the Floater window was last left at. Neither
one ever holds Track text.

## What it sends

Nothing. No analytics, crash reports, font CDNs, artwork proxies, or update pings. Artwork is an image tag against a hostname allowlist. The extension never fetches a URL the music page supplied.

## Mail

Every `runtime.onMessage` is treated as untrusted. Unknown types are dropped. The sender must be one of the two music origins or an extension page. Content scripts cannot open tabs or start downloads.
