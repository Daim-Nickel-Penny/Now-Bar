import { parseOwnerMail, type AdapterMail, type TrackReply } from "../mail/message.ts";
import { isMailboxSender } from "../mail/sender.ts";
import { createFloaterOwner } from "../owner/floater.ts";
import { createOpenOnPlay, type OpenOnPlay } from "../owner/open-on-play.ts";
import { createTriggerPill } from "../owner/trigger-pill.ts";
import {
  DEFAULT_PREFERENCES,
  observePreferences,
  readPreferences,
  type Preferences,
} from "../preferences/preferences.ts";
import type { Track } from "../track/track.ts";
import { createLifeline, type Lifeline } from "./extension-alive.ts";
import type { Reading } from "./reading.ts";
import { observeBar, type BarWatch } from "./observe-bar.ts";
import { pageControls, type ControlSelectors } from "./source-controls.ts";

export type AdapterSpec = {
  read: () => Reading;
  controls: ControlSelectors;
};

/**
 * Preferences are a nicety; the Floater is the point. A storage read that fails must not stop the
 * adapter from starting, or one bad call leaves the tab unrecognised until the page is reloaded.
 */
async function readPreferencesOrDefaults(): Promise<Preferences> {
  try {
    return await readPreferences();
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function mailFor(reading: Reading): AdapterMail {
  switch (reading.kind) {
    case "track":
      return { type: "track", track: reading.track };
    case "silent":
      return { type: "idle" };
    case "unreadable":
      return { type: "unreadable" };
  }
}

function post(life: Lifeline, reading: Reading): void {
  life.guard(() => {
    const mail = mailFor(reading);
    chrome.runtime.sendMessage(mail).catch(() => {
      if (!life.alive()) {
        life.retire();
      }
    });
  });
}

/** Focus and visibility both fire on an ordinary tab switch; one announcement covers both. */
const ANNOUNCE_THROTTLE_MS = 2000;

/**
 * The service worker is evicted after a short idle and comes back with an empty session store,
 * and the adapter only speaks when the bar changes. Re-announcing whenever the tab is shown or
 * focused is what stops the Panel saying "Open a music tab" while a tab is sitting right there.
 */
function announceOnWake(life: Lifeline, watch: BarWatch): () => void {
  let lastAt = 0;
  const wake = (): void => {
    const now = Date.now();
    if (now - lastAt < ANNOUNCE_THROTTLE_MS) {
      return;
    }
    if (document.visibilityState === "visible" && life.alive()) {
      lastAt = now;
      watch.resend();
    }
  };
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("pageshow", wake);
  window.addEventListener("focus", wake);
  return () => {
    document.removeEventListener("visibilitychange", wake);
    window.removeEventListener("pageshow", wake);
    window.removeEventListener("focus", wake);
  };
}

export async function startAdapter(spec: AdapterSpec): Promise<void> {
  const life = createLifeline();
  const preferences = await readPreferencesOrDefaults();
  const owner = createFloaterOwner(window, pageControls(spec.controls), preferences);

  /** The pill reports to the opener and the opener drives the pill, so one of them is wired late. */
  const press = { open: (): void => undefined, dismiss: (): void => undefined };
  const pill = createTriggerPill(
    () => press.open(),
    () => press.dismiss(),
  );
  const opener: OpenOnPlay = createOpenOnPlay(window, owner, pill, preferences);
  press.open = opener.requestOpen;
  press.dismiss = opener.dismissPill;

  let stopPreferences = (): void => undefined;
  life.guard(() => {
    stopPreferences = observePreferences((next) => {
      owner.setPreferences(next);
      opener.onPreferences(next);
    });
  });

  const watch = observeBar(spec.read, (reading) => {
    const track: Track | null = reading.kind === "track" ? reading.track : null;
    post(life, reading);
    owner.setTrack(track);
    opener.onTrack(track);
  });

  const stopWake = announceOnWake(life, watch);

  life.guard(() => {
    chrome.runtime.onMessage.addListener((input: unknown, sender, sendResponse) => {
      if (!isMailboxSender(sender.id, sender.tab?.id, chrome.runtime.id)) {
        return false;
      }
      const mail = parseOwnerMail(input);
      if (mail === null) {
        return false;
      }
      if (mail.type === "reportTrack") {
        const reading = watch.current();
        const reply: TrackReply = {
          type: "trackReply",
          track: reading.kind === "track" ? reading.track : null,
          readable: reading.kind !== "unreadable",
        };
        sendResponse(reply);
        return false;
      }
      opener.requestOpen();
      return false;
    });
  });

  life.onRetire(() => {
    watch.stop();
    stopWake();
    pill.remove();
    try {
      stopPreferences();
    } catch {
      // The storage listener dies with the context it was registered in.
    }
  });
}
