import { SILENT, readingKey, type Reading } from "./reading.ts";

const COALESCE_MS = 150;
/**
 * YouTube Music and Spotify tear the player bar out of the DOM for a moment while they move between
 * pages, and a half-rendered bar reads as unreadable. Reporting either straight away makes the Panel
 * flash on every navigation, so anything that is not a Track has to hold before it is believed.
 */
const SETTLE_MS = 1200;

export type BarWatch = { stop: () => void; current: () => Reading; resend: () => void };

/**
 * Watches the page and emits whenever the bar's reading changes. Uses timers, not
 * requestAnimationFrame, so it keeps working while the music tab is hidden behind the Floater.
 */
export function observeBar(read: () => Reading, emit: (reading: Reading) => void): BarWatch {
  let last = readingKey(SILENT);
  let held: Reading = SILENT;
  let timer = 0;
  let settleTimer = 0;

  function publish(next: Reading): void {
    const key = readingKey(next);
    if (key === last) {
      return;
    }
    last = key;
    held = next;
    emit(next);
  }

  function sample(): void {
    timer = 0;
    const next = read();
    if (next.kind === "track") {
      window.clearTimeout(settleTimer);
      settleTimer = 0;
      publish(next);
      return;
    }
    if (settleTimer !== 0) {
      return;
    }
    settleTimer = window.setTimeout(() => {
      settleTimer = 0;
      const settled = read();
      if (settled.kind !== "track") {
        publish(settled);
      }
    }, SETTLE_MS);
  }

  function schedule(): void {
    if (timer === 0) {
      timer = window.setTimeout(sample, COALESCE_MS);
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

  return {
    current: () => held,
    resend: () => emit(held),
    stop() {
      observer.disconnect();
      window.clearTimeout(timer);
      window.clearTimeout(settleTimer);
    },
  };
}
