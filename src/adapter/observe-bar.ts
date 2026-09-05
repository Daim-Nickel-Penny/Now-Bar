import type { Track } from "../track/track.ts";

const COALESCE_MS = 150;

function snapshotKey(track: Track | null): string {
  if (track === null) {
    return "";
  }
  return [
    track.source,
    track.title,
    track.artist,
    track.album ?? "",
    track.artworkUrl ?? "",
    track.playing ? "1" : "0",
  ].join("\u001f");
}

/**
 * Watches the page for changes and emits a Track whenever the bar's snapshot
 * differs from the last one. Uses a timer, not requestAnimationFrame, so it
 * keeps working while the music tab is hidden behind the Floater.
 */
export function observeBar(read: () => Track | null, emit: (track: Track | null) => void): () => void {
  let last = snapshotKey(null);
  let timer = 0;

  function publish(): void {
    timer = 0;
    const next = read();
    const key = snapshotKey(next);
    if (key === last) {
      return;
    }
    last = key;
    emit(next);
  }

  function schedule(): void {
    if (timer === 0) {
      timer = window.setTimeout(publish, COALESCE_MS);
    }
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
  });
  schedule();

  return () => {
    observer.disconnect();
    window.clearTimeout(timer);
  };
}

export function postTrack(track: Track | null): void {
  const mail = track === null ? { type: "idle" } : { type: "track", track };
  chrome.runtime.sendMessage(mail).catch(() => undefined);
}
