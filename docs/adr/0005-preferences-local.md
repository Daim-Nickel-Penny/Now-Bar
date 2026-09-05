# 0005. Preferences live in storage.local and never hold a Track

## Status

Accepted

## Context

The Panel needs a few durable choices: open on play, AsciiStyle, active Scenes, whether the ScenePlaylist cycles, default ShellVariant. The threat model forbids Track text in `storage.local`.

## Decision

Preferences are a fixed-shape record in `chrome.storage.local` under one key. Reads merge over defaults and drop unknown fields. Adapters observe changes with `storage.onChanged`. NowPlaying stays in `storage.session`.

## Consequences

Preferences survive restarts; NowPlaying does not. Adding a preference means adding a field, a default, and a sanitizer, nothing else. Level is not a Preference — it lives on the tab's media elements for this listen only. See [0006](./0006-level-is-media-volume.md).
