/**
 * A content script outlives the extension that injected it. After a reload, update, or disable,
 * every `chrome.*` call from this script throws "Extension context invalidated" forever — Chrome
 * does not re-inject into tabs that are already open. Nothing here can recover that; the point is
 * to notice, tear down once, and stop throwing on every mutation for the life of the tab.
 */
export function extensionGone(): boolean {
  try {
    return chrome.runtime?.id === undefined;
  } catch {
    return true;
  }
}

export type Lifeline = {
  alive: () => boolean;
  /** Runs `job`, and retires the adapter if the call proves the extension is gone. */
  guard: (job: () => void) => void;
  onRetire: (listener: () => void) => void;
  retire: () => void;
};

export function createLifeline(): Lifeline {
  let retired = false;
  const listeners: Array<() => void> = [];

  function retire(): void {
    if (retired) {
      return;
    }
    retired = true;
    for (const listener of listeners) {
      try {
        listener();
      } catch {
        // A teardown step that fails must not block the rest.
      }
    }
  }

  return {
    alive: () => !retired && !extensionGone(),
    onRetire: (listener) => listeners.push(listener),
    retire,
    /**
     * Retires on any throw. `chrome.runtime.id` can still read back for a moment after the context
     * dies, so trusting it alone leaves the adapter retrying a dead pipe and spraying the page
     * console. Nothing here throws for an ordinary reason, so a throw means it is over.
     */
    guard(job) {
      if (retired || extensionGone()) {
        retire();
        return;
      }
      try {
        job();
      } catch {
        retire();
      }
    },
  };
}
