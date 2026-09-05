# 0004. NowPlaying never leaves the machine

## Status

Accepted

## Context

A now-playing Floater is tempting to "enhance" with analytics, crash reports, or cover-art proxies. Any of those is data collection.

## Decision

The extension has no network client of its own. No telemetry, crash reporter, font CDN, update ping, or artwork proxy. `chrome.storage.session` holds at most one NowPlaying and dies when the browser session ends. Content-script messages are treated as hostile: validate sender URL, reject unknown message types, never `fetch()` a URL the adapter supplied.

## Consequences

Artwork loads in the Owner document via `<img src>` against a hostname allowlist only. There is no privacy-policy data map because nothing is sent. A future score feature must not add a backend without a new ADR.