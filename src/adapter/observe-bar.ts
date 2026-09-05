import type { Track } from "../track/track.ts";

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

export function observeBar(read: () => Track | null, emit: (track: Track | null) => void): () => void {
  let last = snapshotKey(null);
  let frame = 0;
  let watching = false;
  const observer = new MutationObserver(schedule);

  function publish(): void {
    frame = 0;
    const next = read();
    const key = snapshotKey(next);
    if (key === last) {
      return;
    }
    last = key;
    emit(next);
  }

  function schedule(): void {
    if (frame !== 0) {
      return;
    }
    frame = requestAnimationFrame(publish);
  }

  function connect(): void {
    if (watching || document.visibilityState === "hidden") {
      return;
    }
    watching = true;
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
    schedule();
  }

  function disconnect(): void {
    watching = false;
    observer.disconnect();
    if (frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  function onVisibility(): void {
    if (document.visibilityState === "hidden") {
      disconnect();
      return;
    }
    connect();
  }

  document.addEventListener("visibilitychange", onVisibility);
  connect();
  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    disconnect();
  };
}

export function postTrack(track: Track | null): void {
  if (track === null) {
    void chrome.runtime.sendMessage({ type: "idle" });
    return;
  }
  void chrome.runtime.sendMessage({ type: "track", track });
}
